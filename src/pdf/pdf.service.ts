import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { extname, join, resolve } from 'path';
import { CompanySettings } from '../settings/entities/company-settings.entity';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly configService: ConfigService) {}

  async renderPdf(html: string): Promise<Buffer> {
    try {
      const puppeteer = await import('puppeteer');
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
    } catch (error: any) {
      this.logger.error(`PDF render failed: ${error.message}`);
      throw error;
    }
  }

  private logoSource(logoUrl?: string | null): string {
    if (!logoUrl) return '';
    if (/^https?:\/\//i.test(logoUrl)) return this.esc(logoUrl);
    const relativePath = logoUrl.replace(/^\/?uploads\//, '');
    const uploadRoot = resolve(this.configService.get<string>('STORAGE_LOCAL_PATH', './uploads'));
    const filePath = resolve(uploadRoot, relativePath);
    if (!filePath.startsWith(`${uploadRoot}/`) || !existsSync(filePath)) return '';
    const mime = ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' } as Record<string, string>)[extname(filePath).toLowerCase()];
    if (!mime) return '';
    return `data:${mime};base64,${readFileSync(filePath).toString('base64')}`;
  }

  companyHeader(settings?: CompanySettings | null): string {
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

  wrapDocument(title: string, body: string): string {
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
    .totals tr.received td { color:#047857; font-weight:700; border-top:1px solid #d1fae5; padding-top:8px; }
    .totals tr.due td { color:#b91c1c; font-size:13px; font-weight:800; background:#fff1f2; padding-top:7px; padding-bottom:7px; }
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

  esc(value?: string | number | null): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  htmlText(value?: string | null): string {
    return this.esc(value).replace(/\r?\n/g, '<br/>');
  }
}
