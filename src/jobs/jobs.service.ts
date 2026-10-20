import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Decimal from 'decimal.js';
import { Job, JobMaterialUsage, JobLabourRecord, JobStatus } from './entities/job.entity';
import { Quotation, QuotationStatus } from '../quotations/entities/quotation.entity';
import { CompanySettings } from '../settings/entities/company-settings.entity';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { InventoryService } from '../inventory/inventory.service';

export interface CreateJobDto {
  quotationId?: string;
  customerId: string;
  addressId?: string;
  assignedEngineerId?: string;
  title: string;
  description?: string;
  scheduledDate?: string;
  estimatedTotal?: number;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepo: Repository<Job>,
    @InjectRepository(JobMaterialUsage)
    private materialRepo: Repository<JobMaterialUsage>,
    @InjectRepository(JobLabourRecord)
    private labourRepo: Repository<JobLabourRecord>,
    @InjectRepository(Quotation)
    private quotationRepo: Repository<Quotation>,
    @InjectRepository(CompanySettings)
    private settingsRepo: Repository<CompanySettings>,
    @InjectDataSource()
    private dataSource: DataSource,
    private inventoryService: InventoryService,
  ) {}

  private async getNextNumber(): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const settings = await manager.findOne(CompanySettings, { where: {} });
      const num = settings?.jobNextNumber || 1001;
      const prefix = settings?.jobPrefix || 'JOB-';
      if (settings) {
        await manager.update(CompanySettings, settings.id, { jobNextNumber: num + 1 });
      }
      return `${prefix}${num}`;
    });
  }

  async createFromQuotation(quotationId: string, dto: Partial<CreateJobDto>, userId: string): Promise<Job> {
    const quotation = await this.quotationRepo.findOne({
      where: { id: quotationId },
      relations: ['customer', 'installationAddress'],
    });
    if (!quotation) throw new NotFoundException('Quotation not found');
    if (quotation.status !== QuotationStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted quotations can be converted to jobs');
    }

    const jobNumber = await this.getNextNumber();
    const job = this.jobRepo.create({
      jobNumber,
      quotationId,
      customerId: quotation.customerId,
      addressId: quotation.addressId,
      createdById: userId,
      assignedEngineerId: dto.assignedEngineerId,
      title: dto.title || `Installation - ${quotation.quotationNumber}`,
      description: dto.description,
      scheduledDate: dto.scheduledDate,
      estimatedTotal: quotation.grandTotal,
      status: JobStatus.PENDING,
    });

    const saved = await this.jobRepo.save(job);

    // Mark quotation as converted
    await this.quotationRepo.update(quotationId, {
      status: QuotationStatus.CONVERTED,
      convertedAt: new Date(),
    });

    return saved;
  }

  async create(dto: CreateJobDto, userId: string): Promise<Job> {
    const jobNumber = await this.getNextNumber();
    const job = this.jobRepo.create({ ...dto, jobNumber, createdById: userId });
    return this.jobRepo.save(job);
  }

  async findAll(query: PaginationDto & { status?: JobStatus; engineerId?: string; customerId?: string }) {
    const { page = 1, limit = 20, search, status, engineerId, customerId } = query;
    const qb = this.jobRepo.createQueryBuilder('j')
      .leftJoinAndSelect('j.customer', 'c')
      .leftJoinAndSelect('j.assignedEngineer', 'e')
      .leftJoinAndSelect('j.quotation', 'q')
      .orderBy('j.createdAt', 'DESC');

    if (search) qb.where('j.jobNumber ILIKE :s OR j.title ILIKE :s', { s: `%${search}%` });
    if (status) qb.andWhere('j.status = :status', { status });
    if (engineerId) qb.andWhere('j.assignedEngineerId = :engineerId', { engineerId });
    if (customerId) qb.andWhere('j.customerId = :customerId', { customerId });

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: ['customer', 'installationAddress', 'assignedEngineer', 'quotation', 'materialUsages', 'materialUsages.product', 'labourRecords', 'labourRecords.engineer'],
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(id: string, dto: Partial<CreateJobDto & { status: JobStatus; completionNotes: string }>): Promise<Job> {
    await this.findOne(id);
    const update: any = { ...dto };
    if (dto.status === JobStatus.IN_PROGRESS) update.startedAt = new Date();
    if (dto.status === JobStatus.COMPLETED) update.completedAt = new Date();
    await this.jobRepo.update(id, update);
    return this.findOne(id);
  }

  async addMaterialUsage(
    jobId: string,
    dto: Partial<JobMaterialUsage> & { locationId?: string },
    userId: string,
  ): Promise<JobMaterialUsage> {
    const job = await this.findOne(jobId);
    const qty = new Decimal(dto.quantity || 0);
    const cost = new Decimal(dto.unitCost || 0);
    const totalCost = qty.times(cost).toDecimalPlaces(2).toNumber();

    if (dto.productId) {
      const location = dto.locationId
        ? { id: dto.locationId }
        : await this.inventoryService.getDefaultLocation();
      await this.inventoryService.consumeStock({
        productId: dto.productId,
        locationId: location.id,
        quantity: qty.toNumber(),
        referenceType: 'job',
        referenceId: jobId,
        referenceNumber: job.jobNumber,
      }, userId);
    }

    const usage = this.materialRepo.create({
      productId: dto.productId,
      quantity: qty.toNumber(),
      unitCost: cost.toNumber(),
      notes: dto.notes,
      jobId,
      totalCost,
      recordedById: userId,
    });
    const saved = await this.materialRepo.save(usage);

    // Recalculate actual materials cost
    const usages = await this.materialRepo.find({ where: { jobId } });
    const materialsCost = usages.reduce((sum, u) => sum.plus(new Decimal(u.totalCost || 0)), new Decimal(0));
    const latest = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!latest) throw new NotFoundException('Job not found');
    const actualTotal = materialsCost
      .plus(new Decimal(latest.actualLabourCost || 0))
      .plus(new Decimal(latest.actualAdditionalCost || 0));
    await this.jobRepo.update(jobId, {
      actualMaterialsCost: materialsCost.toDecimalPlaces(2).toNumber(),
      actualTotal: actualTotal.toDecimalPlaces(2).toNumber(),
    });

    return saved;
  }

  async addLabourRecord(jobId: string, dto: Partial<JobLabourRecord>): Promise<JobLabourRecord> {
    await this.findOne(jobId);
    const hours = new Decimal(dto.hoursWorked || 0);
    const rate = new Decimal(dto.hourlyRate || 0);
    const totalCost = hours.times(rate).toDecimalPlaces(2).toNumber();

    const record = this.labourRepo.create({ ...dto, jobId, totalCost });
    const saved = await this.labourRepo.save(record);

    // Recalculate actual labour cost
    const records = await this.labourRepo.find({ where: { jobId } });
    const labourCost = records.reduce((sum, r) => sum.plus(new Decimal(r.totalCost || 0)), new Decimal(0));
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    const actualTotal = labourCost
      .plus(new Decimal(job.actualMaterialsCost || 0))
      .plus(new Decimal(job.actualAdditionalCost || 0));
    await this.jobRepo.update(jobId, {
      actualLabourCost: labourCost.toDecimalPlaces(2).toNumber(),
      actualTotal: actualTotal.toDecimalPlaces(2).toNumber(),
    });

    return saved;
  }
}
