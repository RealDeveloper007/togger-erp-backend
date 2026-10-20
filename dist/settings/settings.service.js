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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const company_settings_entity_1 = require("./entities/company-settings.entity");
const vat_rate_entity_1 = require("./entities/vat-rate.entity");
const storage_service_1 = require("../storage/storage.service");
let SettingsService = class SettingsService {
    constructor(settingsRepo, vatRateRepo, storageService) {
        this.settingsRepo = settingsRepo;
        this.vatRateRepo = vatRateRepo;
        this.storageService = storageService;
    }
    async getCompanySettings() {
        let settings = await this.settingsRepo.findOne({ where: {} });
        if (!settings) {
            settings = await this.settingsRepo.save(this.settingsRepo.create({
                name: process.env.COMPANY_NAME || 'Toggar Heat & Aircon',
                email: process.env.COMPANY_EMAIL || '',
            }));
        }
        return settings;
    }
    async updateCompanySettings(dto) {
        const settings = await this.getCompanySettings();
        Object.assign(settings, dto);
        return this.settingsRepo.save(settings);
    }
    async updateCompanyLogo(file) {
        const settings = await this.getCompanySettings();
        const extension = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
        const logoUrl = await this.storageService.saveFile(file.buffer, `company-logo.${extension}`, 'company');
        const previousLogo = settings.logoUrl;
        settings.logoUrl = logoUrl;
        const saved = await this.settingsRepo.save(settings);
        if (previousLogo)
            await this.storageService.deleteFile(previousLogo);
        return saved;
    }
    async getVatRates() {
        return this.vatRateRepo.find({ order: { rate: 'ASC' } });
    }
    async createVatRate(dto) {
        if (dto.isDefault)
            await this.vatRateRepo.update({}, { isDefault: false });
        return this.vatRateRepo.save(this.vatRateRepo.create(dto));
    }
    async updateVatRate(id, dto) {
        if (dto.isDefault)
            await this.vatRateRepo.update({}, { isDefault: false });
        await this.vatRateRepo.update(id, dto);
        const rate = await this.vatRateRepo.findOne({ where: { id } });
        if (!rate)
            throw new common_1.NotFoundException('VAT rate not found');
        return rate;
    }
    async deleteVatRate(id) {
        await this.vatRateRepo.softDelete(id);
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_settings_entity_1.CompanySettings)),
    __param(1, (0, typeorm_1.InjectRepository)(vat_rate_entity_1.VatRate)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        storage_service_1.StorageService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map