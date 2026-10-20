import { BadRequestException, Controller, Get, Patch, Post, Delete, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsEmail, IsOptional, IsString, ValidateIf } from 'class-validator';
import { SettingsService } from './settings.service';
import { CompanySettings } from './entities/company-settings.entity';
import { VatRate } from './entities/vat-rate.entity';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

class UpdateCompanyProfileDto {
  @IsOptional() @IsString() name?: string;
  @ValidateIf((_obj, value) => value !== undefined && value !== null && value !== '') @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() addressLine1?: string;
  @IsOptional() @IsString() addressLine2?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() postcode?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() vatNumber?: string;
  @IsOptional() @IsString() companyRegistrationNumber?: string;
}

@ApiTags('settings')
@ApiBearerAuth('access-token')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('company')
  @ApiOperation({ summary: 'Get company settings' })
  getCompany() { return this.settingsService.getCompanySettings(); }

  @Patch('company')
  @RequirePermissions('settings.manage')
  @ApiOperation({ summary: 'Update company settings' })
  updateCompany(@Body() dto: UpdateCompanyProfileDto) {
    return this.settingsService.updateCompanySettings(dto);
  }

  @Post('company/logo')
  @RequirePermissions('settings.manage')
  @UseInterceptors(FileInterceptor('logo', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload company logo' })
  async uploadCompanyLogo(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Select an image file to upload');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException('Company logos must be JPG, PNG, or WebP');
    }
    return this.settingsService.updateCompanyLogo(file);
  }

  @Get('vat-rates')
  @ApiOperation({ summary: 'Get all VAT rates' })
  getVatRates() { return this.settingsService.getVatRates(); }

  @Post('vat-rates')
  @RequirePermissions('settings.manage')
  createVatRate(@Body() dto: Partial<VatRate>) { return this.settingsService.createVatRate(dto); }

  @Patch('vat-rates/:id')
  @RequirePermissions('settings.manage')
  updateVatRate(@Param('id') id: string, @Body() dto: Partial<VatRate>) {
    return this.settingsService.updateVatRate(id, dto);
  }

  @Delete('vat-rates/:id')
  @RequirePermissions('settings.manage')
  deleteVatRate(@Param('id') id: string) { return this.settingsService.deleteVatRate(id); }
}
