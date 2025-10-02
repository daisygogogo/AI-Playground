import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { AppConfigService } from '../app-config/app-config.service';
import { AppError } from '../../core/enums/app-error.enum';
import { AuthenticatedRequest } from '../../common/types/auth.types';

@Injectable()
export class PlaygroundAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    
    try {
      const decodedToken = this.extractAndDecodeToken(request);
      request.userId = decodedToken.userId;
      request.userRole = decodedToken.role;
      return true;
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  handleError(error: unknown) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedException({
        code: AppError.ACCESS_TOKEN_EXPIRED,
        message: `Access token expired`,
      });
    }
    throw new UnauthorizedException(error);
  }

  private extractAndDecodeToken(request: Request): { userId: string; role: string } {
    // First try to get token from query parameter (for SSE)
    let accessToken = request.query.token as string;
    
    // If not in query, try Authorization header
    if (!accessToken) {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedException({
          code: AppError.ACCESS_TOKEN_NOT_FOUND,
          message: `Access token not found`,
        });
      }
      accessToken = authHeader.split(' ')[1];
    }

    if (!accessToken) {
      throw new UnauthorizedException({
        code: AppError.ACCESS_TOKEN_NOT_FOUND,
        message: `Access token not found`,
      });
    }

    try {
      return this.jwtService.verify(accessToken, {
        secret: this.appConfigService.jwtAccessSecret,
      }) as { userId: string; role: string };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw error;
      }
      throw new UnauthorizedException({
        code: AppError.ACCESS_TOKEN_NOT_FOUND,
        message: `Invalid access token`,
      });
    }
  }
}