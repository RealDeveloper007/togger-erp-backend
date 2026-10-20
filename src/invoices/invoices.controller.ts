import { Controller, Get, Post, Patch, Body, Param, Query, StreamableFile, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvoicesService, CreateInvoiceDto, RecordPaymentDto, ConfirmQuotationInvoiceDto, PaymentReceiptFile } from './invoices.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { InvoiceStatus } from './entities/invoice.entity';

const paymentReceiptUpload = {
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request: unknown, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    callback(allowed.includes(file.mimetype) ? null : new BadRequestException('Receipt must be a PDF, JPG, PNG, or WebP image'), allowed.includes(file.mimetype));
  },
};

function toPaymentReceiptFile(file?: Express.Multer.File): PaymentReceiptFile | undefined {
  if (!file) return undefined;
  const extension = ({ 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as Record<string, string>)[file.mimetype];
  if (!extension) throw new BadRequestException('Receipt must be a PDF, JPG, PNG, or WebP image');
  return { buffer: file.buffer, originalname: `receipt.${extension}` };
}

@ApiTags('invoices')
@ApiBearerAuth('access-token')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @RequirePermissions('invoices.create')
  @ApiOperation({ summary: 'Create invoice' })
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: User) {
    return this.invoicesService.create(dto, user.id);
  }

  @Post('from-job/:jobId')
  @RequirePermissions('invoices.create')
  createFromJob(@Param('jobId') jobId: string, @CurrentUser() user: User) {
    return this.invoicesService.createFromJob(jobId, user.id);
  }

  @Post('from-quotation/:quotationId')
  @RequirePermissions('invoices.create')
  @ApiOperation({ summary: 'Confirm a quotation and create its invoice' })
  @UseInterceptors(FileInterceptor('paymentReceipt', paymentReceiptUpload))
  createFromQuotation(@Param('quotationId') quotationId: string, @Body() dto: ConfirmQuotationInvoiceDto, @UploadedFile() file: Express.Multer.File | undefined, @CurrentUser() user: User) {
    return this.invoicesService.createFromQuotation(quotationId, user.id, { ...dto, paymentReceipt: toPaymentReceiptFile(file) });
  }

  @Get('from-quotation/:quotationId/stock-check')
  @RequirePermissions('invoices.create')
  @ApiOperation({ summary: 'Check stock impact before creating an invoice from a quotation' })
  checkQuotationStock(@Param('quotationId') quotationId: string) {
    return this.invoicesService.checkQuotationStock(quotationId);
  }

  @Get('next-number')
  @RequirePermissions('invoices.create')
  @ApiOperation({ summary: 'Preview the next invoice number without reserving it' })
  getNextInvoiceNumber() {
    return this.invoicesService.getNextInvoiceNumber();
  }

  @Get(':id/pdf')
  @RequirePermissions('invoices.view')
  @ApiOperation({ summary: 'Download invoice PDF' })
  async pdf(@Param('id') id: string) {
    const buffer = await this.invoicesService.generatePdf(id);
    return new StreamableFile(buffer, { type: 'application/pdf', disposition: 'attachment; filename="invoice.pdf"' });
  }

  @Get()
  @RequirePermissions('invoices.view')
  @ApiOperation({ summary: 'List invoices' })
  findAll(@Query() query: PaginationDto & { status?: InvoiceStatus; customerId?: string }) {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('invoices.view')
  findOne(@Param('id') id: string) { return this.invoicesService.findOne(id); }

  @Get('payments/:paymentId/attachment')
  @RequirePermissions('invoices.view')
  @ApiOperation({ summary: 'View a payment receipt attachment' })
  async paymentAttachment(@Param('paymentId') paymentId: string) {
    const file = await this.invoicesService.getPaymentAttachment(paymentId);
    return new StreamableFile(file.buffer, { type: file.mimeType, disposition: `inline; filename="${file.filename}"` });
  }

  @Post(':id/payments')
  @RequirePermissions('invoices.create')
  @ApiOperation({ summary: 'Record payment against invoice' })
  @UseInterceptors(FileInterceptor('paymentReceipt', paymentReceiptUpload))
  recordPayment(@Param('id') id: string, @Body() dto: RecordPaymentDto, @UploadedFile() file: Express.Multer.File | undefined, @CurrentUser() user: User) {
    return this.invoicesService.recordPayment(id, dto, user.id, toPaymentReceiptFile(file));
  }

  @Patch(':id/status')
  @RequirePermissions('invoices.update')
  updateStatus(@Param('id') id: string, @Body('status') status: InvoiceStatus) {
    return this.invoicesService.updateStatus(id, status);
  }
}
