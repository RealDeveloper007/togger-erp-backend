import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname, join, resolve } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;
  private readonly privatePaymentDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('STORAGE_LOCAL_PATH', './uploads');
    this.privatePaymentDir = resolve(this.uploadDir, '../private-invoice-payments');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(buffer: Buffer, originalName: string, subDir = 'general'): Promise<string> {
    const ext = originalName.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const dir = join(this.uploadDir, subDir);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const filePath = join(dir, filename);
    writeFileSync(filePath, buffer);
    return `/uploads/${subDir}/${filename}`;
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const relativePath = url.replace('/uploads/', '');
      const filePath = join(this.uploadDir, relativePath);
      if (existsSync(filePath)) unlinkSync(filePath);
    } catch (e) {
      this.logger.warn(`Failed to delete file: ${url}`);
    }
  }

  async savePrivatePaymentFile(buffer: Buffer, originalName: string): Promise<string> {
    const extension = extname(originalName).toLowerCase();
    if (!['.pdf', '.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
      throw new Error('Unsupported payment receipt file type');
    }
    if (!existsSync(this.privatePaymentDir)) mkdirSync(this.privatePaymentDir, { recursive: true });
    const filename = `${uuidv4()}${extension}`;
    writeFileSync(join(this.privatePaymentDir, filename), buffer);
    return filename;
  }

  readPrivatePaymentFile(filename: string): { buffer: Buffer; mimeType: string; filename: string } | null {
    if (!/^[0-9a-f-]+\.(pdf|jpe?g|png|webp)$/i.test(filename)) return null;
    const filePath = resolve(this.privatePaymentDir, filename);
    if (!filePath.startsWith(`${this.privatePaymentDir}/`) || !existsSync(filePath)) return null;
    const extension = extname(filename).toLowerCase();
    const mimeType = ({ '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' } as Record<string, string>)[extension];
    return { buffer: readFileSync(filePath), mimeType, filename };
  }
}
