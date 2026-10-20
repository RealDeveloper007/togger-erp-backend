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
exports.QuotationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const quotations_service_1 = require("./quotations.service");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const quotation_entity_1 = require("./entities/quotation.entity");
let QuotationsController = class QuotationsController {
    constructor(quotationsService) {
        this.quotationsService = quotationsService;
    }
    create(dto, user) {
        return this.quotationsService.create(dto, user.id);
    }
    findAll(query) {
        return this.quotationsService.findAll(query);
    }
    findOne(id) { return this.quotationsService.findOne(id); }
    updateStatus(id, status) {
        return this.quotationsService.updateStatus(id, status);
    }
    duplicate(id, user) {
        return this.quotationsService.duplicate(id, user.id);
    }
    update(id, dto) {
        return this.quotationsService.updateDraft(id, dto);
    }
    async pdf(id) {
        const buffer = await this.quotationsService.generatePdf(id);
        return new common_1.StreamableFile(buffer, {
            type: 'application/pdf',
            disposition: `attachment; filename="quotation-${id}.pdf"`,
        });
    }
    email(id, to) {
        return this.quotationsService.emailPdf(id, to);
    }
    remove(id) { return this.quotationsService.remove(id); }
};
exports.QuotationsController = QuotationsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('quotations.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create quotation' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('quotations.view'),
    (0, swagger_1.ApiOperation)({ summary: 'List quotations' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('quotations.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quotation detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.RequirePermissions)('quotations.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update quotation status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, permissions_decorator_1.RequirePermissions)('quotations.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicate a quotation as new revision' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('quotations.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, permissions_decorator_1.RequirePermissions)('quotations.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuotationsController.prototype, "pdf", null);
__decorate([
    (0, common_1.Post)(':id/email'),
    (0, permissions_decorator_1.RequirePermissions)('quotations.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "email", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('quotations.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete draft quotation' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotationsController.prototype, "remove", null);
exports.QuotationsController = QuotationsController = __decorate([
    (0, swagger_1.ApiTags)('quotations'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('quotations'),
    __metadata("design:paramtypes", [quotations_service_1.QuotationsService])
], QuotationsController);
//# sourceMappingURL=quotations.controller.js.map