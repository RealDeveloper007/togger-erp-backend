import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async notifyLowStock(productName: string, available: number, reorderLevel: number) {
    this.logger.warn(`LOW STOCK ALERT: ${productName} — Available: ${available}, Reorder Level: ${reorderLevel}`);
    // TODO: Send email/push notification
  }

  async notifyQuotationExpiring(quotationNumber: string, customerName: string, daysLeft: number) {
    this.logger.log(`QUOTATION EXPIRING: ${quotationNumber} for ${customerName} expires in ${daysLeft} days`);
  }

  async notifyInvoiceOverdue(invoiceNumber: string, customerName: string, amountOutstanding: number) {
    this.logger.warn(`OVERDUE INVOICE: ${invoiceNumber} for ${customerName} — Outstanding: £${amountOutstanding}`);
  }
}
