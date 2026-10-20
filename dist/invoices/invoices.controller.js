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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const invoices_service_1 = require("./invoices.service");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const invoice_entity_1 = require("./entities/invoice.entity");
const paymentReceiptUpload = {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        callback(allowed.includes(file.mimetype) ? null : new common_1.BadRequestException('Receipt must be a PDF, JPG, PNG, or WebP image'), allowed.includes(file.mimetype));
    },
};
function toPaymentReceiptFile(file) {
    if (!file)
        return undefined;
    const extension = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.mimetype];
    if (!extension)
        throw new common_1.BadRequestException('Receipt must be a PDF, JPG, PNG, or WebP image');
    return { buffer: file.buffer, originalname: `receipt.${extension}` };
}
let InvoicesController = class InvoicesController {
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    create(dto, user) {
        return this.invoicesService.create(dto, user.id);
    }
    createFromJob(jobId, user) {
        return this.invoicesService.createFromJob(jobId, user.id);
    }
    createFromQuotation(quotationId, dto, file, user) {
        return this.invoicesService.createFromQuotation(quotationId, user.id, { ...dto, paymentReceipt: toPaymentReceiptFile(file) });
    }
    checkQuotationStock(quotationId) {
        return this.invoicesService.checkQuotationStock(quotationId);
    }
    getNextInvoiceNumber() {
        return this.invoicesService.getNextInvoiceNumber();
    }
    async pdf(id) {
        const buffer = await this.invoicesService.generatePdf(id);
        return new common_1.StreamableFile(buffer, { type: 'application/pdf', disposition: 'attachment; filename="invoice.pdf"' });
    }
    findAll(query) {
        return this.invoicesService.findAll(query);
    }
    findOne(id) { return this.invoicesService.findOne(id); }
    async paymentAttachment(paymentId) {
        const file = await this.invoicesService.getPaymentAttachment(paymentId);
        return new common_1.StreamableFile(file.buffer, { type: file.mimeType, disposition: `inline; filename="${file.filename}"` });
    }
    recordPayment(id, dto, file, user) {
        return this.invoicesService.recordPayment(id, dto, user.id, toPaymentReceiptFile(file));
    }
    updateStatus(id, status) {
        return this.invoicesService.updateStatus(id, status);
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('invoices.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create invoice' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('from-job/:jobId'),
    (0, permissions_decorator_1.RequirePermissions)('invoices.create'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "createFromJob", null);
__decorate([
    (0, common_1.Post)('from-quotation/:quotationId'),
    (0, permissions_decorator_1.RequirePermissions)('invoices.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm a quotation and create its invoice' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('paymentReceipt', paymentReceiptUpload)),
    __param(0, (0, common_1.Param)('quotationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "createFromQuotation", null);
__decorate([
    (0, common_1.Get)('from-quotation/:quotationId/stock-check'),
    (0, permissions_decorator_1.RequirePermissions)('invoices.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Check stock impact before creating an invoice from a quotation' }),
    __param(0, (0, common_1.Param)('quotationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "checkQuotationStock", null);
__decorate([
    (0, common_1.Get)('next-number'),
    (0, permissions_decorator_1.RequirePermissions)('invoices.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview the next invoice number without reserving it' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "getNextInvoiceNumber", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, permissions_decorator_1.RequirePermissions)('invoices.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Download invoice PDF' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "pdf", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('invoices.view'),
    (0, swagger_1.ApiOperation)({ summary: 'List invoices' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('invoices.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('payments/:paymentId/attachment'),
    (0, permissions_decorator_1.RequirePermissions)('invoices.view'),
    (0, swagger_1.ApiOperation)({ summary: 'View a payment receipt attachment' }),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "paymentAttachment", null);
__decorate([
    (0, common_1.Post)(':id/payments'),
    (0, permissions_decorator_1.RequirePermissions)('invoices.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Record payment against invoice' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('paymentReceipt', paymentReceiptUpload)),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, permissions_decorator_1.RequirePermissions)('invoices.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "updateStatus", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('invoices'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('invoices'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map