import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { AuthenticatedRequest } from '../../common/types/auth.types';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.userId;

    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    // Check rate limit: 30 requests per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const rateLimitTimes = 50;
    
    const recentSessions = await this.prisma.aISession.count({
      where: {
        userId,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentSessions >= rateLimitTimes) {
      throw new HttpException(
        {
          message: 'Rate limit exceeded. You can make up to 30 requests per hour.',
          rateLimitExceeded: true,
          resetTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }
}