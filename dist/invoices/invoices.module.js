"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const invoices_controller_1 = require("./invoices.controller");
const invoices_service_1 = require("./invoices.service");
const invoice_entity_1 = require("./entities/invoice.entity");
const job_entity_1 = require("../jobs/entities/job.entity");
const company_settings_entity_1 = require("../settings/entities/company-settings.entity");
const quotation_entity_1 = require("../quotations/entities/quotation.entity");
const pdf_module_1 = require("../pdf/pdf.module");
const inventory_module_1 = require("../inventory/inventory.module");
const storage_module_1 = require("../storage/storage.module");
let InvoicesModule = class InvoicesModule {
};
exports.InvoicesModule = InvoicesModule;
exports.InvoicesModule = InvoicesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([invoice_entity_1.Invoice, invoice_entity_1.InvoiceLine, invoice_entity_1.Payment, job_entity_1.Job, company_settings_entity_1.CompanySettings, quotation_entity_1.Quotation]), pdf_module_1.PdfModule, inventory_module_1.InventoryModule, storage_module_1.StorageModule],
        controllers: [invoices_controller_1.InvoicesController],
        providers: [invoices_service_1.InvoicesService],
        exports: [invoices_service_1.InvoicesService],
    })
], InvoicesModule);
//# sourceMappingURL=invoices.module.js.map