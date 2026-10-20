import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabourRate } from './entities/labour-rate.entity';

@Injectable()
export class LabourService {
  constructor(
    @InjectRepository(LabourRate)
    private labourRepo: Repository<LabourRate>,
  ) {}

  findAll(activeOnly = false) {
    return this.labourRepo.find({
      where: activeOnly ? { isActive: true } : {},
      order: { name: 'ASC' },
    });
  }

  async create(dto: Partial<LabourRate>) {
    return this.labourRepo.save(this.labourRepo.create(dto));
  }

  async update(id: string, dto: Partial<LabourRate>) {
    const item = await this.labourRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Labour rate not found');
    Object.assign(item, dto);
    return this.labourRepo.save(item);
  }

  async remove(id: string) {
    await this.labourRepo.softDelete(id);
  }
}
