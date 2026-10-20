"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const quotations_controller_1 = require("./quotations.controller");
const quotations_service_1 = require("./quotations.service");
const quotation_entity_1 = require("./entities/quotation.entity");
const product_entity_1 = require("../products/entities/product.entity");
const company_settings_entity_1 = require("../settings/entities/company-settings.entity");
const pricing_module_1 = require("../pricing/pricing.module");
const pdf_module_1 = require("../pdf/pdf.module");
const email_module_1 = require("../email/email.module");
let QuotationsModule = class QuotationsModule {
};
exports.QuotationsModule = QuotationsModule;
exports.QuotationsModule = QuotationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                quotation_entity_1.Quotation, quotation_entity_1.QuotationLine, quotation_entity_1.QuotationLabourCharge, quotation_entity_1.QuotationAdditionalCharge,
                product_entity_1.Product, company_settings_entity_1.CompanySettings,
            ]),
            pricing_module_1.PricingModule,
            pdf_module_1.PdfModule,
            email_module_1.EmailModule,
        ],
        controllers: [quotations_controller_1.QuotationsController],
        providers: [quotations_service_1.QuotationsService],
        exports: [quotations_service_1.QuotationsService],
    })
], QuotationsModule);
//# sourceMappingURL=quotations.module.js.map