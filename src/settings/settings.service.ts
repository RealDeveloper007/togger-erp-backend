import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySettings } from './entities/company-settings.entity';
import { VatRate } from './entities/vat-rate.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(CompanySettings)
    private settingsRepo: Repository<CompanySettings>,
    @InjectRepository(VatRate)
    private vatRateRepo: Repository<VatRate>,
    private storageService: StorageService,
  ) {}

  async getCompanySettings(): Promise<CompanySettings> {
    let settings = await this.settingsRepo.findOne({ where: {} });
    if (!settings) {
      settings = await this.settingsRepo.save(this.settingsRepo.create({
        name: process.env.COMPANY_NAME || 'Toggar Heat & Aircon',
        email: process.env.COMPANY_EMAIL || '',
      }));
    }
    return settings;
  }

  async updateCompanySettings(dto: Partial<CompanySettings>): Promise<CompanySettings> {
    const settings = await this.getCompanySettings();
    Object.assign(settings, dto);
    return this.settingsRepo.save(settings);
  }

  async updateCompanyLogo(file: Express.Multer.File): Promise<CompanySettings> {
    const settings = await this.getCompanySettings();
    const extension = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const logoUrl = await this.storageService.saveFile(file.buffer, `company-logo.${extension}`, 'company');
    const previousLogo = settings.logoUrl;
    settings.logoUrl = logoUrl;
    const saved = await this.settingsRepo.save(settings);
    if (previousLogo) await this.storageService.deleteFile(previousLogo);
    return saved;
  }

  async getVatRates(): Promise<VatRate[]> {
    return this.vatRateRepo.find({ order: { rate: 'ASC' } });
  }

  async createVatRate(dto: Partial<VatRate>): Promise<VatRate> {
    if (dto.isDefault) await this.vatRateRepo.update({}, { isDefault: false });
    return this.vatRateRepo.save(this.vatRateRepo.create(dto));
  }

  async updateVatRate(id: string, dto: Partial<VatRate>): Promise<VatRate> {
    if (dto.isDefault) await this.vatRateRepo.update({}, { isDefault: false });
    await this.vatRateRepo.update(id, dto);
    const rate = await this.vatRateRepo.findOne({ where: { id } });
    if (!rate) throw new NotFoundException('VAT rate not found');
    return rate;
  }

  async deleteVatRate(id: string): Promise<void> {
    await this.vatRateRepo.softDelete(id);
  }
}
