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
exports.CustomersService = exports.CreateCustomerDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const customer_entity_1 = require("./entities/customer.entity");
const customer_address_entity_1 = require("./entities/customer-address.entity");
const pagination_dto_1 = require("../common/dto/pagination.dto");
class CreateCustomerDto {
}
exports.CreateCustomerDto = CreateCustomerDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(customer_entity_1.CustomerType),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "companyName", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((_object, value) => value !== undefined && value !== null && value !== ''),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "mobile", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "billingAddressLine1", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "billingAddressLine2", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "billingCity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "billingPostcode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "billingCountry", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCustomerDto.prototype, "vatExempt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "vatNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCustomerDto.prototype, "addresses", void 0);
let CustomersService = class CustomersService {
    constructor(customerRepo, addressRepo) {
        this.customerRepo = customerRepo;
        this.addressRepo = addressRepo;
    }
    async create(dto) {
        const { addresses, ...rest } = dto;
        const values = this.normalizeContactDetails(rest);
        await this.assertUniqueContactDetails(values);
        try {
            const customer = this.customerRepo.create(values);
            const saved = await this.customerRepo.save(customer);
            if (addresses?.length) {
                for (const addr of addresses) {
                    await this.addressRepo.save(this.addressRepo.create({ ...addr, customerId: saved.id }));
                }
            }
            return this.findOne(saved.id);
        }
        catch (error) {
            this.throwIfDuplicateContact(error);
            throw error;
        }
    }
    async findAll(query) {
        const { page = 1, limit = 20, search } = query;
        const qb = this.customerRepo.createQueryBuilder('c')
            .leftJoinAndSelect('c.addresses', 'addr')
            .orderBy('c.createdAt', 'DESC');
        if (search) {
            qb.where('c.firstName ILIKE :s OR c.lastName ILIKE :s OR c.companyName ILIKE :s OR c.email ILIKE :s OR c.phone ILIKE :s OR c.customerCode ILIKE :s OR CAST(c.id AS text) ILIKE :s', { s: `%${search}%` });
        }
        const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async findOne(id) {
        const customer = await this.customerRepo.findOne({
            where: { id },
            relations: ['addresses'],
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return customer;
    }
    async update(id, dto) {
        const customer = await this.findOne(id);
        const values = this.normalizeContactDetails(dto);
        await this.assertUniqueContactDetails(values, id);
        try {
            Object.assign(customer, values);
            await this.customerRepo.save(customer);
            return this.findOne(id);
        }
        catch (error) {
            this.throwIfDuplicateContact(error);
            throw error;
        }
    }
    async remove(id) {
        await this.findOne(id);
        await this.customerRepo.softDelete(id);
    }
    async addAddress(customerId, dto) {
        await this.findOne(customerId);
        const address = this.addressRepo.create({ ...dto, customerId });
        return this.addressRepo.save(address);
    }
    async updateAddress(addressId, dto) {
        const address = await this.addressRepo.findOne({ where: { id: addressId } });
        if (!address)
            throw new common_1.NotFoundException('Address not found');
        Object.assign(address, dto);
        return this.addressRepo.save(address);
    }
    async removeAddress(addressId) {
        await this.addressRepo.softDelete(addressId);
    }
    normalizeContactDetails(values) {
        return {
            ...values,
            ...(values.email !== undefined ? { email: values.email?.trim().toLowerCase() || null } : {}),
            ...(values.phone !== undefined ? { phone: values.phone?.trim() || null } : {}),
        };
    }
    async assertUniqueContactDetails(values, excludeId) {
        const email = values.email?.trim().toLowerCase();
        if (email) {
            const query = this.customerRepo.createQueryBuilder('c')
                .where('LOWER(BTRIM(c.email)) = :email', { email });
            if (excludeId)
                query.andWhere('c.id != :excludeId', { excludeId });
            if (await query.getOne())
                throw new common_1.ConflictException('A customer with this email address already exists.');
        }
        const phone = values.phone?.replace(/\D/g, '');
        if (phone) {
            const query = this.customerRepo.createQueryBuilder('c')
                .where("regexp_replace(c.phone, '[^0-9]', '', 'g') = :phone", { phone });
            if (excludeId)
                query.andWhere('c.id != :excludeId', { excludeId });
            if (await query.getOne())
                throw new common_1.ConflictException('A customer with this phone number already exists.');
        }
    }
    throwIfDuplicateContact(error) {
        if ((error?.code ?? error?.driverError?.code) !== '23505')
            return;
        const constraint = error?.constraint || error?.driverError?.constraint;
        if (constraint === 'UQ_customers_email_active')
            throw new common_1.ConflictException('A customer with this email address already exists.');
        if (constraint === 'UQ_customers_phone_active')
            throw new common_1.ConflictException('A customer with this phone number already exists.');
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_address_entity_1.CustomerAddress)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map