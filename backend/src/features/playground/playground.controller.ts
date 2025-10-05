import { Controller, Get, Query, Sse, UseGuards, Request, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PlaygroundService } from './playground.service';
import { OpenAIProvider } from './providers/openai.provider';
import { AuthenticationGuard } from '../authentication/authentication.guard';
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
  @UseGuards(AuthenticationGuard)
  async listSessions(@Request() req: AuthenticatedRequest, @Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    const p = Math.max(parseInt(page) || 1, 1);
    const ps = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100);
    const offset = (p - 1) * ps;
    
    const [items, total] = await Promise.all([
      this.prisma.aISession.findMany({
        where: { userId: req.userId },
        select: {
          id: true,
          prompt: true,
          createdAt: true,
          updatedAt: true,
          totalCost: true,
          totalTokens: true,
          status: true,
        },
        orderBy: { createdAt: 'desc' },
        take: ps,
        skip: offset,
      }),
      this.prisma.aISession.count({
        where: { userId: req.userId },
      }),
    ]);
    
    return { items, total, page: p, pageSize: ps };
  }

  @Get('sessions/:id')
  @UseGuards(AuthenticationGuard)
  async getSession(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const session = await this.prisma.aISession.findFirst({
      where: { id, userId: req.userId },
      include: { conversations: { orderBy: { createdAt: 'asc' } } },
    });
    return session;
  }

  @Get('stream')
  @Sse()
  @UseGuards(AuthenticationGuard, RateLimitGuard)
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
    
    // Process all models concurrently
    const promises = models.map(async (modelName) => {
      try {
        // Send initial status
        observer.next({
          data: JSON.stringify({
            type: 'status',
            model: modelName,
            status: 'streaming'
          })
        } as MessageEvent);

        // Create AI provider instance
        const provider = new OpenAIProvider(modelName);
        const startTime = Date.now();
        let fullResponse = '';
        
        // Real-time streaming
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

        // Save conversation record
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

            // Update session totals
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
        
        // Send metrics
        observer.next({
          data: JSON.stringify({
            type: 'metrics',
            model: modelName,
            tokensUsed: inputTokens + outputTokens,
            cost,
            responseTime
          })
        } as MessageEvent);
        
        // Send completion status
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
    
    // Wait for all models to complete
    await Promise.allSettled(promises);
    
    // Mark session as completed
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