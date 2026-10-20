import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';

export interface LineItemInput {
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  vatRate?: number;
}

export interface CalculatedLine {
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  lineSubtotal: number;
  lineTotal: number;
  vatRate: number;
  vatAmount: number;
  lineTotalWithVat: number;
}

export interface QuotationTotals {
  subtotalProducts: number;
  subtotalLabour: number;
  subtotalAdditional: number;
  subtotalBeforeDiscount: number;
  discountAmount: number;
  taxableAmount: number;
  vatAmount: number;
  grandTotal: number;
  vatBreakdown: { rate: number; taxableAmount: number; vatAmount: number }[];
}

/**
 * PricingService — ALL monetary calculations use Decimal.js.
 * Never use native JS floating-point for financial arithmetic.
 */
@Injectable()
export class PricingService {
  calculateLine(input: LineItemInput): CalculatedLine {
    const qty = new Decimal(input.quantity);
    const price = new Decimal(input.unitPrice);
    const discountPct = new Decimal(input.discountPercent ?? 0);
    const vatRate = new Decimal(input.vatRate ?? 20);

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

  calculateQuotationTotals(input: {
    productLines: { lineTotal: number; vatRate: number; vatAmount: number }[];
    labourLines: { lineTotal: number; vatRate: number }[];
    additionalLines: { lineTotal: number; vatRate: number }[];
    globalDiscountAmount?: number;
  }): QuotationTotals {
    const subtotalProducts = input.productLines.reduce(
      (sum, l) => sum.plus(new Decimal(l.lineTotal)), new Decimal(0));
    const subtotalLabour = input.labourLines.reduce(
      (sum, l) => sum.plus(new Decimal(l.lineTotal)), new Decimal(0));
    const subtotalAdditional = input.additionalLines.reduce(
      (sum, l) => sum.plus(new Decimal(l.lineTotal)), new Decimal(0));

    const subtotalBeforeDiscount = subtotalProducts.plus(subtotalLabour).plus(subtotalAdditional);
    const discountAmount = new Decimal(input.globalDiscountAmount ?? 0);
    const taxableAmount = subtotalBeforeDiscount.minus(discountAmount);

    const vatMap = new Map<number, { taxable: Decimal; vat: Decimal }>();
    const allLines = [
      ...input.productLines,
      ...input.labourLines.map((l) => ({
        lineTotal: l.lineTotal,
        vatRate: l.vatRate,
        vatAmount: new Decimal(l.lineTotal).times(l.vatRate).dividedBy(100).toDecimalPlaces(2).toNumber(),
      })),
      ...input.additionalLines.map((l) => ({
        lineTotal: l.lineTotal,
        vatRate: l.vatRate,
        vatAmount: new Decimal(l.lineTotal).times(l.vatRate).dividedBy(100).toDecimalPlaces(2).toNumber(),
      })),
    ];

    for (const line of allLines) {
      const rate = line.vatRate;
      const existing = vatMap.get(rate) || { taxable: new Decimal(0), vat: new Decimal(0) };
      vatMap.set(rate, {
        taxable: existing.taxable.plus(new Decimal(line.lineTotal)),
        vat: existing.vat.plus(new Decimal(line.vatAmount)),
      });
    }

    const vatBreakdown = Array.from(vatMap.entries()).map(([rate, v]) => ({
      rate,
      taxableAmount: v.taxable.toDecimalPlaces(2).toNumber(),
      vatAmount: v.vat.toDecimalPlaces(2).toNumber(),
    }));

    const vatAmount = vatBreakdown.reduce(
      (sum, v) => sum.plus(new Decimal(v.vatAmount)), new Decimal(0));
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

  roundMoney(value: number): number {
    return new Decimal(value).toDecimalPlaces(2).toNumber();
  }
}
