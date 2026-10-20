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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const fs_1 = require("fs");
const uuid_1 = require("uuid");
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StorageService_1.name);
        this.uploadDir = this.configService.get('STORAGE_LOCAL_PATH', './uploads');
        this.privatePaymentDir = (0, path_1.resolve)(this.uploadDir, '../private-invoice-payments');
        if (!(0, fs_1.existsSync)(this.uploadDir)) {
            (0, fs_1.mkdirSync)(this.uploadDir, { recursive: true });
        }
    }
    async saveFile(buffer, originalName, subDir = 'general') {
        const ext = originalName.split('.').pop();
        const filename = `${(0, uuid_1.v4)()}.${ext}`;
        const dir = (0, path_1.join)(this.uploadDir, subDir);
        if (!(0, fs_1.existsSync)(dir))
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        const filePath = (0, path_1.join)(dir, filename);
        (0, fs_1.writeFileSync)(filePath, buffer);
        return `/uploads/${subDir}/${filename}`;
    }
    async deleteFile(url) {
        try {
            const relativePath = url.replace('/uploads/', '');
            const filePath = (0, path_1.join)(this.uploadDir, relativePath);
            if ((0, fs_1.existsSync)(filePath))
                (0, fs_1.unlinkSync)(filePath);
        }
        catch (e) {
            this.logger.warn(`Failed to delete file: ${url}`);
        }
    }
    async savePrivatePaymentFile(buffer, originalName) {
        const extension = (0, path_1.extname)(originalName).toLowerCase();
        if (!['.pdf', '.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
            throw new Error('Unsupported payment receipt file type');
        }
        if (!(0, fs_1.existsSync)(this.privatePaymentDir))
            (0, fs_1.mkdirSync)(this.privatePaymentDir, { recursive: true });
        const filename = `${(0, uuid_1.v4)()}${extension}`;
        (0, fs_1.writeFileSync)((0, path_1.join)(this.privatePaymentDir, filename), buffer);
        return filename;
    }
    readPrivatePaymentFile(filename) {
        if (!/^[0-9a-f-]+\.(pdf|jpe?g|png|webp)$/i.test(filename))
            return null;
        const filePath = (0, path_1.resolve)(this.privatePaymentDir, filename);
        if (!filePath.startsWith(`${this.privatePaymentDir}/`) || !(0, fs_1.existsSync)(filePath))
            return null;
        const extension = (0, path_1.extname)(filename).toLowerCase();
        const mimeType = { '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[extension];
        return { buffer: (0, fs_1.readFileSync)(filePath), mimeType, filename };
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map