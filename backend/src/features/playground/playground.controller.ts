import { Controller, Get, Query, Sse, UseGuards, Request, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PlaygroundService } from './playground.service';
import { OpenAIProvider } from './providers/openai.provider';
import { PlaygroundAuthGuard } from './playground-auth.guard';
import { RateLimitGuard } from './rate-limit.guard';
import { AuthenticatedRequest } from '../../common/types/auth.types';
import { PrismaService } from 'nestjs-prisma';

@Controller('playground')
export class PlaygroundController {
  constructor(
    private playgroundService: PlaygroundService,
    private prisma: PrismaService,
  ) {}
  
  @Get('sessions')
  @UseGuards(PlaygroundAuthGuard)
  async listSessions(@Request() req: AuthenticatedRequest, @Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    const p = Math.max(parseInt(page) || 1, 1);
    const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100);
    const offset = (p - 1) * ps;
    const [items, totalRow]: any = await Promise.all([
      this.prisma.$queryRawUnsafe(
        'SELECT id, "prompt", "createdAt", "updatedAt", "totalCost", "totalTokens", "status" FROM "AISession" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3',
        req.userId, ps, offset,
      ),
      this.prisma.$queryRawUnsafe('SELECT COUNT(*)::int AS count FROM "AISession" WHERE "userId" = $1', req.userId),
    ]);
    const total = Array.isArray(totalRow) ? (totalRow[0]?.count ?? 0) : (totalRow?.count ?? 0);
    return { items, total, page: p, pageSize: ps };
  }

  @Get('sessions/:id')
  @UseGuards(PlaygroundAuthGuard)
  async getSession(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const session = await this.prisma.aISession.findFirst({
      where: { id, userId: req.userId },
      include: { conversations: { orderBy: { createdAt: 'asc' } } },
    });
    return session;
  }

  @Get('stream')
  @Sse()
  @UseGuards(PlaygroundAuthGuard, RateLimitGuard)
  async streamCompletion(
    @Query('prompt') prompt: string,
    @Query('models') models: string,
    @Query('sessionId') sessionId: string | undefined,
    @Request() req: AuthenticatedRequest,
  ): Promise<Observable<MessageEvent>> {
    
    const selectedModels = models.split(',');
    
    return new Observable(observer => {
      this.processPrompt(prompt, selectedModels, req.userId, observer, sessionId);
    });
  }

  private async processPrompt(
    prompt: string, 
    models: string[], 
    userId: string,
    observer: any,
    sessionId?: string,
  ) {
    console.log(`Processing prompt for models: ${models.join(', ')}`);
    
    // 创建或复用AI会话记录
    let session: any;
    try {
      if (sessionId) {
        session = await this.prisma.aISession.findFirst({ where: { id: sessionId, userId } });
        if (!session) {
          session = await this.prisma.aISession.create({
            data: { userId, prompt, models, status: 'ACTIVE' },
          });
        } else {
          await this.prisma.aISession.update({
            where: { id: session.id },
            data: { updatedAt: new Date(), status: 'ACTIVE' },
          });
        }
      } else {
        session = await this.prisma.aISession.create({
          data: { userId, prompt, models, status: 'ACTIVE' },
        });
      }
      if (session) {
        observer.next({
          data: JSON.stringify({ type: 'session', sessionId: session.id })
        } as MessageEvent);
      }
    } catch (error) {
      console.error('Failed to create/update AI session:', error);
    }
    
    // 并发处理所有模型
    const promises = models.map(async (modelName) => {
      try {
        // 发送开始状态
        observer.next({
          data: JSON.stringify({
            type: 'status',
            model: modelName,
            status: 'streaming'
          })
        } as MessageEvent);

        // 创建AI提供商实例
        const provider = new OpenAIProvider(modelName);
        const startTime = Date.now();
        let fullResponse = '';
        
        // 实时流式传输
        for await (const chunk of provider.streamCompletion(prompt)) {
          fullResponse += chunk;
          
          observer.next({
            data: JSON.stringify({
              type: 'chunk',
              model: modelName,
              content: chunk,
              timestamp: Date.now()
            })
          } as MessageEvent);
        }
        
        const responseTime = Date.now() - startTime;
        const inputTokens = provider.estimateTokens(prompt);
        const outputTokens = provider.estimateTokens(fullResponse);
        const cost = provider.calculateCost(inputTokens, outputTokens);

        // 保存对话记录
        if (session) {
          try {
            await this.prisma.aIConversation.create({
              data: {
                sessionId: session.id,
                modelName,
                userPrompt: prompt,
                response: fullResponse,
                inputTokens,
                outputTokens,
                cost,
                responseTime,
                status: 'COMPLETED',
              },
            });

            // 更新会话总计
            await this.prisma.aISession.update({
              where: { id: session.id },
              data: {
                totalCost: { increment: cost },
                totalTokens: { increment: inputTokens + outputTokens },
              },
            });
          } catch (error) {
            console.error('Failed to save conversation:', error);
          }
        }
        
        // 发送指标
        observer.next({
          data: JSON.stringify({
            type: 'metrics',
            model: modelName,
            tokensUsed: inputTokens + outputTokens,
            cost,
            responseTime
          })
        } as MessageEvent);
        
        // 发送完成状态
        observer.next({
          data: JSON.stringify({
            type: 'status',
            model: modelName,
            status: 'complete'
          })
        } as MessageEvent);
        
      } catch (error) {
        observer.next({
          data: JSON.stringify({
            type: 'status',
            model: modelName,
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
          })
        } as MessageEvent);
      }
    });
    
    // 等待所有模型完成
    await Promise.allSettled(promises);
    
    // 标记会话完成
    if (session) {
      try {
        await this.prisma.aISession.update({
          where: { id: session.id },
          data: { status: 'COMPLETED' },
        });
      } catch (error) {
        console.error('Failed to update session status:', error);
      }
    }
    
    observer.complete();
  }

}