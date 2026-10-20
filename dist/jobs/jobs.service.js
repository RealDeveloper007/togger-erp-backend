"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decimal_js_1 = require("decimal.js");
const job_entity_1 = require("./entities/job.entity");
const quotation_entity_1 = require("../quotations/entities/quotation.entity");
const company_settings_entity_1 = require("../settings/entities/company-settings.entity");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const inventory_service_1 = require("../inventory/inventory.service");
let JobsService = class JobsService {
    constructor(jobRepo, materialRepo, labourRepo, quotationRepo, settingsRepo, dataSource, inventoryService) {
        this.jobRepo = jobRepo;
        this.materialRepo = materialRepo;
        this.labourRepo = labourRepo;
        this.quotationRepo = quotationRepo;
        this.settingsRepo = settingsRepo;
        this.dataSource = dataSource;
        this.inventoryService = inventoryService;
    }
    async getNextNumber() {
        return this.dataSource.transaction(async (manager) => {
            const settings = await manager.findOne(company_settings_entity_1.CompanySettings, { where: {} });
            const num = settings?.jobNextNumber || 1001;
            const prefix = settings?.jobPrefix || 'JOB-';
            if (settings) {
                await manager.update(company_settings_entity_1.CompanySettings, settings.id, { jobNextNumber: num + 1 });
            }
            return `${prefix}${num}`;
        });
    }
    async createFromQuotation(quotationId, dto, userId) {
        const quotation = await this.quotationRepo.findOne({
            where: { id: quotationId },
            relations: ['customer', 'installationAddress'],
        });
        if (!quotation)
            throw new common_1.NotFoundException('Quotation not found');
        if (quotation.status !== quotation_entity_1.QuotationStatus.ACCEPTED) {
            throw new common_1.BadRequestException('Only accepted quotations can be converted to jobs');
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
            status: job_entity_1.JobStatus.PENDING,
        });
        const saved = await this.jobRepo.save(job);
        await this.quotationRepo.update(quotationId, {
            status: quotation_entity_1.QuotationStatus.CONVERTED,
            convertedAt: new Date(),
        });
        return saved;
    }
    async create(dto, userId) {
        const jobNumber = await this.getNextNumber();
        const job = this.jobRepo.create({ ...dto, jobNumber, createdById: userId });
        return this.jobRepo.save(job);
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, status, engineerId, customerId } = query;
        const qb = this.jobRepo.createQueryBuilder('j')
            .leftJoinAndSelect('j.customer', 'c')
            .leftJoinAndSelect('j.assignedEngineer', 'e')
            .leftJoinAndSelect('j.quotation', 'q')
            .orderBy('j.createdAt', 'DESC');
        if (search)
            qb.where('j.jobNumber ILIKE :s OR j.title ILIKE :s', { s: `%${search}%` });
        if (status)
            qb.andWhere('j.status = :status', { status });
        if (engineerId)
            qb.andWhere('j.assignedEngineerId = :engineerId', { engineerId });
        if (customerId)
            qb.andWhere('j.customerId = :customerId', { customerId });
        const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async findOne(id) {
        const job = await this.jobRepo.findOne({
            where: { id },
            relations: ['customer', 'installationAddress', 'assignedEngineer', 'quotation', 'materialUsages', 'materialUsages.product', 'labourRecords', 'labourRecords.engineer'],
        });
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        return job;
    }
    async update(id, dto) {
        await this.findOne(id);
        const update = { ...dto };
        if (dto.status === job_entity_1.JobStatus.IN_PROGRESS)
            update.startedAt = new Date();
        if (dto.status === job_entity_1.JobStatus.COMPLETED)
            update.completedAt = new Date();
        await this.jobRepo.update(id, update);
        return this.findOne(id);
    }
    async addMaterialUsage(jobId, dto, userId) {
        const job = await this.findOne(jobId);
        const qty = new decimal_js_1.default(dto.quantity || 0);
        const cost = new decimal_js_1.default(dto.unitCost || 0);
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
        const usages = await this.materialRepo.find({ where: { jobId } });
        const materialsCost = usages.reduce((sum, u) => sum.plus(new decimal_js_1.default(u.totalCost || 0)), new decimal_js_1.default(0));
        const latest = await this.jobRepo.findOne({ where: { id: jobId } });
        if (!latest)
            throw new common_1.NotFoundException('Job not found');
        const actualTotal = materialsCost
            .plus(new decimal_js_1.default(latest.actualLabourCost || 0))
            .plus(new decimal_js_1.default(latest.actualAdditionalCost || 0));
        await this.jobRepo.update(jobId, {
            actualMaterialsCost: materialsCost.toDecimalPlaces(2).toNumber(),
            actualTotal: actualTotal.toDecimalPlaces(2).toNumber(),
        });
        return saved;
    }
    async addLabourRecord(jobId, dto) {
        await this.findOne(jobId);
        const hours = new decimal_js_1.default(dto.hoursWorked || 0);
        const rate = new decimal_js_1.default(dto.hourlyRate || 0);
        const totalCost = hours.times(rate).toDecimalPlaces(2).toNumber();
        const record = this.labourRepo.create({ ...dto, jobId, totalCost });
        const saved = await this.labourRepo.save(record);
        const records = await this.labourRepo.find({ where: { jobId } });
        const labourCost = records.reduce((sum, r) => sum.plus(new decimal_js_1.default(r.totalCost || 0)), new decimal_js_1.default(0));
        const job = await this.jobRepo.findOne({ where: { id: jobId } });
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        const actualTotal = labourCost
            .plus(new decimal_js_1.default(job.actualMaterialsCost || 0))
            .plus(new decimal_js_1.default(job.actualAdditionalCost || 0));
        await this.jobRepo.update(jobId, {
            actualLabourCost: labourCost.toDecimalPlaces(2).toNumber(),
            actualTotal: actualTotal.toDecimalPlaces(2).toNumber(),
        });
        return saved;
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(1, (0, typeorm_1.InjectRepository)(job_entity_1.JobMaterialUsage)),
    __param(2, (0, typeorm_1.InjectRepository)(job_entity_1.JobLabourRecord)),
    __param(3, (0, typeorm_1.InjectRepository)(quotation_entity_1.Quotation)),
    __param(4, (0, typeorm_1.InjectRepository)(company_settings_entity_1.CompanySettings)),
    __param(5, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        inventory_service_1.InventoryService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map