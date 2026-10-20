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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const class_validator_1 = require("class-validator");
const settings_service_1 = require("./settings.service");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
class UpdateCompanyProfileDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyProfileDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((_obj, value) => value !== undefined && value !== null && value !== ''),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateCompanyProfileDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyProfileDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyProfileDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyProfileDto.prototype, "addressLine1", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyProfileDto.prototype, "addressLine2", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyProfileDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyProfileDto.prototype, "postcode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyProfileDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyProfileDto.prototype, "vatNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCompanyProfileDto.prototype, "companyRegistrationNumber", void 0);
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    getCompany() { return this.settingsService.getCompanySettings(); }
    updateCompany(dto) {
        return this.settingsService.updateCompanySettings(dto);
    }
    async uploadCompanyLogo(file) {
        if (!file)
            throw new common_1.BadRequestException('Select an image file to upload');
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            throw new common_1.BadRequestException('Company logos must be JPG, PNG, or WebP');
        }
        return this.settingsService.updateCompanyLogo(file);
    }
    getVatRates() { return this.settingsService.getVatRates(); }
    createVatRate(dto) { return this.settingsService.createVatRate(dto); }
    updateVatRate(id, dto) {
        return this.settingsService.updateVatRate(id, dto);
    }
    deleteVatRate(id) { return this.settingsService.deleteVatRate(id); }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('company'),
    (0, swagger_1.ApiOperation)({ summary: 'Get company settings' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getCompany", null);
__decorate([
    (0, common_1.Patch)('company'),
    (0, permissions_decorator_1.RequirePermissions)('settings.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Update company settings' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateCompanyProfileDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateCompany", null);
__decorate([
    (0, common_1.Post)('company/logo'),
    (0, permissions_decorator_1.RequirePermissions)('settings.manage'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo', { limits: { fileSize: 5 * 1024 * 1024 } })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload company logo' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "uploadCompanyLogo", null);
__decorate([
    (0, common_1.Get)('vat-rates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all VAT rates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getVatRates", null);
__decorate([
    (0, common_1.Post)('vat-rates'),
    (0, permissions_decorator_1.RequirePermissions)('settings.manage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "createVatRate", null);
__decorate([
    (0, common_1.Patch)('vat-rates/:id'),
    (0, permissions_decorator_1.RequirePermissions)('settings.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "updateVatRate", null);
__decorate([
    (0, common_1.Delete)('vat-rates/:id'),
    (0, permissions_decorator_1.RequirePermissions)('settings.manage'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "deleteVatRate", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('settings'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map