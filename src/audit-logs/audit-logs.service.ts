import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
  ) {}

  async log(data: Partial<AuditLog>): Promise<AuditLog> {
    return this.auditLogRepo.save(this.auditLogRepo.create(data));
  }

  async findAll(query: { page?: number; limit?: number; entityType?: string; userId?: string }) {
    const { page = 1, limit = 50, entityType, userId } = query;
    const qb = this.auditLogRepo.createQueryBuilder('al')
      .leftJoinAndSelect('al.user', 'u')
      .orderBy('al.createdAt', 'DESC');
    if (entityType) qb.andWhere('al.entityType = :entityType', { entityType });
    if (userId) qb.andWhere('al.userId = :userId', { userId });
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total };
  }
}
