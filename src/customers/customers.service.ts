import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsArray, IsBoolean, IsEmail, IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Customer, CustomerType } from './entities/customer.entity';
import { CustomerAddress } from './entities/customer-address.entity';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

export class CreateCustomerDto {
  @IsOptional()
  @IsEnum(CustomerType)
  type?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @ValidateIf((_object, value) => value !== undefined && value !== null && value !== '')
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  billingAddressLine1?: string;

  @IsOptional()
  @IsString()
  billingAddressLine2?: string;

  @IsOptional()
  @IsString()
  billingCity?: string;

  @IsOptional()
  @IsString()
  billingPostcode?: string;

  @IsOptional()
  @IsString()
  billingCountry?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  vatExempt?: boolean;

  @IsOptional()
  @IsString()
  vatNumber?: string;

  @IsOptional()
  @IsArray()
  addresses?: Partial<CustomerAddress>[];
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(CustomerAddress)
    private addressRepo: Repository<CustomerAddress>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const { addresses, ...rest } = dto;
    const values = this.normalizeContactDetails(rest);
    await this.assertUniqueContactDetails(values);
    try {
      const customer = this.customerRepo.create(values as any);
      const saved = await this.customerRepo.save(customer as unknown as Customer);
      if (addresses?.length) {
        for (const addr of addresses) {
          await this.addressRepo.save(this.addressRepo.create({ ...addr, customerId: saved.id }));
        }
      }
      return this.findOne(saved.id);
    } catch (error) {
      this.throwIfDuplicateContact(error);
      throw error;
    }
  }

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 20, search } = query;
    const qb = this.customerRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.addresses', 'addr')
      .orderBy('c.createdAt', 'DESC');
    if (search) {
      qb.where(
        'c.firstName ILIKE :s OR c.lastName ILIKE :s OR c.companyName ILIKE :s OR c.email ILIKE :s OR c.phone ILIKE :s OR c.customerCode ILIKE :s OR CAST(c.id AS text) ILIKE :s',
        { s: `%${search}%` }
      );
    }
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { id },
      relations: ['addresses'],
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: string, dto: Partial<CreateCustomerDto>): Promise<Customer> {
    const customer = await this.findOne(id);
    const values = this.normalizeContactDetails(dto);
    await this.assertUniqueContactDetails(values, id);
    try {
      Object.assign(customer, values);
      await this.customerRepo.save(customer);
      return this.findOne(id);
    } catch (error) {
      this.throwIfDuplicateContact(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.customerRepo.softDelete(id);
  }

  async addAddress(customerId: string, dto: Partial<CustomerAddress>): Promise<CustomerAddress> {
    await this.findOne(customerId);
    const address = this.addressRepo.create({ ...dto, customerId });
    return this.addressRepo.save(address);
  }

  async updateAddress(addressId: string, dto: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const address = await this.addressRepo.findOne({ where: { id: addressId } });
    if (!address) throw new NotFoundException('Address not found');
    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async removeAddress(addressId: string): Promise<void> {
    await this.addressRepo.softDelete(addressId);
  }

  private normalizeContactDetails<T extends Partial<CreateCustomerDto>>(values: T): T {
    return {
      ...values,
      ...(values.email !== undefined ? { email: values.email?.trim().toLowerCase() || null } : {}),
      ...(values.phone !== undefined ? { phone: values.phone?.trim() || null } : {}),
    } as T;
  }

  private async assertUniqueContactDetails(values: Partial<CreateCustomerDto>, excludeId?: string): Promise<void> {
    const email = values.email?.trim().toLowerCase();
    if (email) {
      const query = this.customerRepo.createQueryBuilder('c')
        .where('LOWER(BTRIM(c.email)) = :email', { email });
      if (excludeId) query.andWhere('c.id != :excludeId', { excludeId });
      if (await query.getOne()) throw new ConflictException('A customer with this email address already exists.');
    }

    const phone = values.phone?.replace(/\D/g, '');
    if (phone) {
      const query = this.customerRepo.createQueryBuilder('c')
        .where("regexp_replace(c.phone, '[^0-9]', '', 'g') = :phone", { phone });
      if (excludeId) query.andWhere('c.id != :excludeId', { excludeId });
      if (await query.getOne()) throw new ConflictException('A customer with this phone number already exists.');
    }
  }

  private throwIfDuplicateContact(error: any): void {
    if ((error?.code ?? error?.driverError?.code) !== '23505') return;
    const constraint = error?.constraint || error?.driverError?.constraint;
    if (constraint === 'UQ_customers_email_active') throw new ConflictException('A customer with this email address already exists.');
    if (constraint === 'UQ_customers_phone_active') throw new ConflictException('A customer with this phone number already exists.');
  }
}
