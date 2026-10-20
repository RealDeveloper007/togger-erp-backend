import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
  ) {}

  async create(dto: Partial<Supplier>): Promise<Supplier> {
    return this.supplierRepo.save(this.supplierRepo.create(dto));
  }

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const qb = this.supplierRepo.createQueryBuilder('s').orderBy('s.name', 'ASC');
    if (search) qb.where('s.name ILIKE :s OR s.email ILIKE :s OR s.contactName ILIKE :s', { s: `%${search}%` });
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Supplier> {
    const s = await this.supplierRepo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  async update(id: string, dto: Partial<Supplier>): Promise<Supplier> {
    await this.findOne(id);
    await this.supplierRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.supplierRepo.softDelete(id);
  }
}
