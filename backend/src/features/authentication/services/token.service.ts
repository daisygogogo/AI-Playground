import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../app-config/app-config.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
  ) {}

  verifyToken(refreshToken: string): { userId: string; role: string } {
    return this.jwtService.verify(refreshToken, {
      secret: this.appConfigService.jwtRefreshSecret,
    });
  }

  createTokens(userId: string, userRole: string) {
    return {
      accessToken: this.jwtService.sign(
        { userId, role: userRole },
        {
          secret: this.appConfigService.jwtAccessSecret,
          expiresIn: this.appConfigService.jwtAccessExpiresIn,
        },
      ),
      refreshToken: this.jwtService.sign(
        { userId, role: userRole },
        {
          secret: this.appConfigService.jwtRefreshSecret,
          expiresIn: this.appConfigService.jwtRefreshExpiresIn,
        },
      ),
    };
  }
}
