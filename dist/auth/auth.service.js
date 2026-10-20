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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const user_entity_1 = require("../users/entities/user.entity");
const refresh_token_entity_1 = require("./entities/refresh-token.entity");
let AuthService = class AuthService {
    constructor(userRepository, refreshTokenRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(email, password) {
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
            relations: ['roles', 'roles.permissions'],
        });
        if (!user)
            return null;
        if (user.status !== user_entity_1.UserStatus.ACTIVE)
            return null;
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid)
            return null;
        return user;
    }
    async login(user, req) {
        const tokens = await this.generateTokens(user, req);
        await this.userRepository.update(user.id, { lastLoginAt: new Date() });
        return {
            user: this.sanitizeUser(user),
            ...tokens,
        };
    }
    async refreshTokens(refreshToken, req) {
        const tokenHash = this.hashToken(refreshToken);
        const storedToken = await this.refreshTokenRepository.findOne({
            where: { tokenHash, isRevoked: false },
            relations: ['user', 'user.roles', 'user.roles.permissions'],
        });
        if (!storedToken)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        if (storedToken.expiresAt < new Date()) {
            await this.refreshTokenRepository.update(storedToken.id, { isRevoked: true });
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        if (storedToken.user.status !== user_entity_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        await this.refreshTokenRepository.update(storedToken.id, { isRevoked: true });
        const tokens = await this.generateTokens(storedToken.user, req);
        return {
            user: this.sanitizeUser(storedToken.user),
            ...tokens,
        };
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            const tokenHash = this.hashToken(refreshToken);
            await this.refreshTokenRepository.update({ userId, tokenHash }, { isRevoked: true });
        }
        else {
            await this.refreshTokenRepository.update({ userId }, { isRevoked: true });
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid)
            throw new common_1.BadRequestException('Current password is incorrect');
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.userRepository.update(userId, { passwordHash });
        await this.refreshTokenRepository.update({ userId }, { isRevoked: true });
    }
    async forgotPassword(email) {
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
        });
        if (!user || user.status !== user_entity_1.UserStatus.ACTIVE)
            return;
        const resetToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = this.hashToken(resetToken);
        const expires = new Date(Date.now() + 60 * 60 * 1000);
        await this.userRepository.update(user.id, {
            passwordResetToken: tokenHash,
            passwordResetExpires: expires,
        });
        return resetToken;
    }
    async resetPassword(token, newPassword) {
        const tokenHash = this.hashToken(token);
        const user = await this.userRepository.findOne({
            where: { passwordResetToken: tokenHash },
        });
        if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new common_1.BadRequestException('Password reset token is invalid or has expired');
        }
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.userRepository.update(user.id, {
            passwordHash,
            passwordResetToken: null,
            passwordResetExpires: null,
        });
        await this.refreshTokenRepository.update({ userId: user.id }, { isRevoked: true });
    }
    async generateTokens(user, req) {
        const payload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);
        const refreshTokenValue = (0, crypto_1.randomBytes)(40).toString('hex');
        const tokenHash = this.hashToken(refreshTokenValue);
        const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.refreshTokenRepository.save({
            userId: user.id,
            tokenHash,
            expiresAt,
            userAgent: req?.headers?.['user-agent'],
            ipAddress: req?.ip,
        });
        return { accessToken, refreshToken: refreshTokenValue };
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    sanitizeUser(user) {
        const { passwordHash, passwordResetToken, passwordResetExpires, ...safe } = user;
        return safe;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map