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
var PdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs_1 = require("fs");
const path_1 = require("path");
let PdfService = PdfService_1 = class PdfService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PdfService_1.name);
    }
    async renderPdf(html) {
        try {
            const puppeteer = await Promise.resolve().then(() => require('puppeteer'));
            const browser = await puppeteer.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '16mm', right: '12mm', bottom: '16mm', left: '12mm' },
            });
            await browser.close();
            return Buffer.from(pdf);
        }
        catch (error) {
            this.logger.error(`PDF render failed: ${error.message}`);
            throw error;
        }
    }
    logoSource(logoUrl) {
        if (!logoUrl)
            return '';
        if (/^https?:\/\//i.test(logoUrl))
            return this.esc(logoUrl);
        const relativePath = logoUrl.replace(/^\/?uploads\//, '');
        const uploadRoot = (0, path_1.resolve)(this.configService.get('STORAGE_LOCAL_PATH', './uploads'));
        const filePath = (0, path_1.resolve)(uploadRoot, relativePath);
        if (!filePath.startsWith(`${uploadRoot}/`) || !(0, fs_1.existsSync)(filePath))
            return '';
        const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' }[(0, path_1.extname)(filePath).toLowerCase()];
        if (!mime)
            return '';
        return `data:${mime};base64,${(0, fs_1.readFileSync)(filePath).toString('base64')}`;
    }
    companyHeader(settings) {
        const logo = this.logoSource(settings?.logoUrl);
        const address = [settings?.addressLine1, settings?.addressLine2, [settings?.city, settings?.postcode].filter(Boolean).join(', '), settings?.country]
            .filter(Boolean)
            .map((part) => this.esc(part));
        const contacts = [
            settings?.email ? `<div><span class="company-label">Email</span><span>${this.esc(settings.email)}</span></div>` : '',
            settings?.phone ? `<div><span class="company-label">Phone</span><span>${this.esc(settings.phone)}</span></div>` : '',
            settings?.website ? `<div><span class="company-label">Web</span><span>${this.esc(settings.website)}</span></div>` : '',
        ].filter(Boolean);
        const legal = [
            settings?.vatNumber ? `<div><span class="company-label">VAT number</span><span>${this.esc(settings.vatNumber)}</span></div>` : '',
            settings?.companyRegistrationNumber ? `<div><span class="company-label">Company number</span><span>${this.esc(settings.companyRegistrationNumber)}</span></div>` : '',
        ].filter(Boolean);
        return `
      <header class="company-header">
        <div class="company-brand">${logo ? `<img src="${logo}" alt="Company logo" />` : `<div class="company-name">${this.esc(settings?.name || 'Company')}</div>`}</div>
        <div class="company-details">
          ${address.length ? `<section class="company-address"><div class="company-heading">Registered address</div>${address.map((line) => `<div>${line}</div>`).join('')}</section>` : ''}
          ${contacts.length ? `<section class="company-contact"><div class="company-heading">Contact</div>${contacts.join('')}</section>` : ''}
          ${legal.length ? `<section class="company-legal">${legal.join('')}</section>` : ''}
        </div>
      </header>
    `;
    }
    wrapDocument(title, body) {
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${this.esc(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, Arial, sans-serif; color: #172033; font-size: 12px; line-height: 1.5; }
    .company-header { display:flex; justify-content:space-between; align-items:flex-start; gap:28px; border-bottom:3px solid #f97316; padding:0 0 18px; margin:0 0 24px; break-inside:avoid; }
    .company-brand { display:flex; align-items:flex-start; flex:0 0 34%; min-width:0; padding-top:4px; }
    .company-brand img { display:block; max-width:190px; max-height:76px; object-fit:contain; object-position:left top; }
    .company-name { color:#111827; font-size:23px; line-height:1.2; font-weight:700; }
    .company-details { flex:1; min-width:0; display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,1fr); gap:12px 22px; color:#475569; font-size:10px; line-height:1.55; overflow-wrap:anywhere; }
    .company-heading { margin-bottom:4px; color:#172033; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.09em; }
    .company-address { grid-row:span 2; }
    .company-contact > div,.company-legal > div { display:flex; gap:6px; }
    .company-label { flex:0 0 70px; color:#64748b; }
    .company-legal { padding-top:8px; border-top:1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { text-align: left; background: #f1f5f9; padding: 9px 10px; font-size: 10px; text-transform: uppercase; letter-spacing:.04em; color: #52627a; }
    td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; vertical-align:top; }
    .totals { margin: 16px 0 16px auto; width: 42%; min-width: 280px; }
    .totals td { border: 0; padding: 4px 8px; }
    .totals td:first-child { width: 68%; }
    .totals td:last-child { text-align: right; white-space: nowrap; }
    .grand { font-size: 16px; font-weight: 700; color:#c2410c; }
    .muted { color: #64748b; }
    .quote-title { display:flex; justify-content:space-between; align-items:flex-start; margin:22px 0 16px; }
    .quote-title h2 { margin:0 0 5px; font-size:24px; letter-spacing:-.02em; }
    .quote-number { color:#ea580c; font-size:17px; font-weight:700; }
    .quote-meta { text-align:right; font-size:11px; line-height:1.7; }
    .client { display:flex; justify-content:space-between; gap:24px; padding:16px; background:#f8fafc; border:1px solid #dbe3ed; border-radius:8px; break-inside:avoid; }
    .client > div { width:50%; min-width:0; }
    .client-left { line-height:1.7; overflow-wrap:anywhere; }
    .client-right { padding-left:18px; border-left:1px solid #dbe3ed; line-height:1.7; overflow-wrap:anywhere; }
    .client-right p { margin:0; }
    .client h3 { margin:0 0 8px; color:#64748b; font-size:10px; text-transform:uppercase; letter-spacing:.08em; }
    .invoice-status { display:inline-flex; margin-top:8px; padding:4px 10px; border-radius:999px; color:#075985; background:#e0f2fe; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; }
    .invoice-status.unpaid { color:#075985; background:#e0f2fe; }
    .invoice-status.paid { color:#047857; background:#d1fae5; }
    .invoice-status.partially-paid { color:#92400e; background:#fef3c7; }
    .invoice-status.overdue { color:#b91c1c; background:#fee2e2; }
    .invoice-status.cancelled { color:#475569; background:#e2e8f0; }
    .payment-summary { width:48%; min-width:300px; margin:10px 0 16px auto; padding:12px 15px; border:1px solid #e2e8f0; border-radius:10px; background:#f8fafc; break-inside:avoid; }
    .payment-summary-row { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:6px 0; }
    .payment-summary-row + .payment-summary-row { border-top:1px solid #e2e8f0; }
    .payment-summary .received { color:#047857; font-weight:700; }
    .payment-summary .due { color:#b91c1c; font-weight:800; }
    .invoice-details { margin:14px 0; padding:12px 14px; border:1px solid #dbe3ed; border-radius:8px; background:#f8fafc; break-inside:avoid; }
    .invoice-details h3 { margin:0 0 7px; color:#64748b; font-size:10px; text-transform:uppercase; letter-spacing:.08em; }
    .invoice-details-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
    .invoice-detail-label { display:block; color:#64748b; font-size:9px; text-transform:uppercase; letter-spacing:.05em; }
    .invoice-detail-value { font-weight:700; overflow-wrap:anywhere; }
    .installation { margin-top:10px; padding:12px 14px; border:1px solid #e5e7eb; border-radius:8px; color:#4b5563; }
    .installation h3 { margin:0 0 6px; font-size:10px; text-transform:uppercase; color:#64748b; }
    .note,.terms { margin-top:18px; line-height:1.6; }
    .note { padding:13px 15px; border:1px solid #dbe3ed; border-radius:8px; background:#f8fafc; }
    .note h3 { margin:0 0 6px; color:#64748b; font-size:10px; text-transform:uppercase; letter-spacing:.08em; }
    .terms { border-top:1px solid #e5e7eb; padding-top:12px; color:#4b5563; }
    .terms p { margin-top:5px; line-height:1.6; }
    @media print { .company-header,.client,.installation,.totals { break-inside:avoid; } }
  </style>
</head>
<body>${body}</body>
</html>`;
    }
    esc(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    htmlText(value) {
        return this.esc(value).replace(/\r?\n/g, '<br/>');
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = PdfService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PdfService);
//# sourceMappingURL=pdf.service.js.map