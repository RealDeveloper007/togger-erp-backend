import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { User, UserStatus } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) return null;
    if (user.status !== UserStatus.ACTIVE) return null;
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;
    return user;
  }

  async login(user: User, req?: any) {
    const tokens = await this.generateTokens(user, req);
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string, req?: any) {
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash, isRevoked: false },
      relations: ['user', 'user.roles', 'user.roles.permissions'],
    });

    if (!storedToken) throw new UnauthorizedException('Invalid refresh token');
    if (storedToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.update(storedToken.id, { isRevoked: true });
      throw new UnauthorizedException('Refresh token expired');
    }
    if (storedToken.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Rotate: revoke old token
    await this.refreshTokenRepository.update(storedToken.id, { isRevoked: true });

    const tokens = await this.generateTokens(storedToken.user, req);
    return {
      user: this.sanitizeUser(storedToken.user),
      ...tokens,
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.refreshTokenRepository.update({ userId, tokenHash }, { isRevoked: true });
    } else {
      // Revoke all tokens for this user
      await this.refreshTokenRepository.update({ userId }, { isRevoked: true });
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new BadRequestException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(userId, { passwordHash });
    // Revoke all refresh tokens after password change
    await this.refreshTokenRepository.update({ userId }, { isRevoked: true });
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    // Always return success to prevent email enumeration
    if (!user || user.status !== UserStatus.ACTIVE) return;

    const resetToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(resetToken);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepository.update(user.id, {
      passwordResetToken: tokenHash,
      passwordResetExpires: expires,
    });

    // TODO: Send email with resetToken
    return resetToken; // In production, this would be sent via email
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: tokenHash },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Password reset token is invalid or has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(user.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
    await this.refreshTokenRepository.update({ userId: user.id }, { isRevoked: true });
  }

  private async generateTokens(user: User, req?: any) {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    const refreshTokenValue = randomBytes(40).toString('hex');
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

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private sanitizeUser(user: User) {
    const { passwordHash, passwordResetToken, passwordResetExpires, ...safe } = user as any;
    return safe;
  }
}
