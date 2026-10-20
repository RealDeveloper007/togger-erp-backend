"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = require("decimal.js");
let PricingService = class PricingService {
    calculateLine(input) {
        const qty = new decimal_js_1.default(input.quantity);
        const price = new decimal_js_1.default(input.unitPrice);
        const discountPct = new decimal_js_1.default(input.discountPercent ?? 0);
        const vatRate = new decimal_js_1.default(input.vatRate ?? 20);
        const lineSubtotal = qty.times(price);
        const discountAmount = lineSubtotal.times(discountPct).dividedBy(100).toDecimalPlaces(2);
        const lineTotal = lineSubtotal.minus(discountAmount);
        const vatAmount = lineTotal.times(vatRate).dividedBy(100).toDecimalPlaces(2);
        const lineTotalWithVat = lineTotal.plus(vatAmount);
        return {
            quantity: qty.toNumber(),
            unitPrice: price.toDecimalPlaces(2).toNumber(),
            discountAmount: discountAmount.toNumber(),
            lineSubtotal: lineSubtotal.toDecimalPlaces(2).toNumber(),
            lineTotal: lineTotal.toDecimalPlaces(2).toNumber(),
            vatRate: vatRate.toNumber(),
            vatAmount: vatAmount.toNumber(),
            lineTotalWithVat: lineTotalWithVat.toDecimalPlaces(2).toNumber(),
        };
    }
    calculateQuotationTotals(input) {
        const subtotalProducts = input.productLines.reduce((sum, l) => sum.plus(new decimal_js_1.default(l.lineTotal)), new decimal_js_1.default(0));
        const subtotalLabour = input.labourLines.reduce((sum, l) => sum.plus(new decimal_js_1.default(l.lineTotal)), new decimal_js_1.default(0));
        const subtotalAdditional = input.additionalLines.reduce((sum, l) => sum.plus(new decimal_js_1.default(l.lineTotal)), new decimal_js_1.default(0));
        const subtotalBeforeDiscount = subtotalProducts.plus(subtotalLabour).plus(subtotalAdditional);
        const discountAmount = new decimal_js_1.default(input.globalDiscountAmount ?? 0);
        const taxableAmount = subtotalBeforeDiscount.minus(discountAmount);
        const vatMap = new Map();
        const allLines = [
            ...input.productLines,
            ...input.labourLines.map((l) => ({
                lineTotal: l.lineTotal,
                vatRate: l.vatRate,
                vatAmount: new decimal_js_1.default(l.lineTotal).times(l.vatRate).dividedBy(100).toDecimalPlaces(2).toNumber(),
            })),
            ...input.additionalLines.map((l) => ({
                lineTotal: l.lineTotal,
                vatRate: l.vatRate,
                vatAmount: new decimal_js_1.default(l.lineTotal).times(l.vatRate).dividedBy(100).toDecimalPlaces(2).toNumber(),
            })),
        ];
        for (const line of allLines) {
            const rate = line.vatRate;
            const existing = vatMap.get(rate) || { taxable: new decimal_js_1.default(0), vat: new decimal_js_1.default(0) };
            vatMap.set(rate, {
                taxable: existing.taxable.plus(new decimal_js_1.default(line.lineTotal)),
                vat: existing.vat.plus(new decimal_js_1.default(line.vatAmount)),
            });
        }
        const vatBreakdown = Array.from(vatMap.entries()).map(([rate, v]) => ({
            rate,
            taxableAmount: v.taxable.toDecimalPlaces(2).toNumber(),
            vatAmount: v.vat.toDecimalPlaces(2).toNumber(),
        }));
        const vatAmount = vatBreakdown.reduce((sum, v) => sum.plus(new decimal_js_1.default(v.vatAmount)), new decimal_js_1.default(0));
        const grandTotal = taxableAmount.plus(vatAmount);
        return {
            subtotalProducts: subtotalProducts.toDecimalPlaces(2).toNumber(),
            subtotalLabour: subtotalLabour.toDecimalPlaces(2).toNumber(),
            subtotalAdditional: subtotalAdditional.toDecimalPlaces(2).toNumber(),
            subtotalBeforeDiscount: subtotalBeforeDiscount.toDecimalPlaces(2).toNumber(),
            discountAmount: discountAmount.toDecimalPlaces(2).toNumber(),
            taxableAmount: taxableAmount.toDecimalPlaces(2).toNumber(),
            vatAmount: vatAmount.toDecimalPlaces(2).toNumber(),
            grandTotal: grandTotal.toDecimalPlaces(2).toNumber(),
            vatBreakdown,
        };
    }
    roundMoney(value) {
        return new decimal_js_1.default(value).toDecimalPlaces(2).toNumber();
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)()
], PricingService);
//# sourceMappingURL=pricing.service.js.map