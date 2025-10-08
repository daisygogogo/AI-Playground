import { Injectable } from '@nestjs/common';
import { AIProvider } from './base.provider';
import { DatabaseAgentService } from '../../agent/database-agent.service';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class DatabaseAgentProvider implements AIProvider {
  name = 'Database Agent';
  private agentService: DatabaseAgentService;

  constructor(private prisma: PrismaService) {
    this.agentService = new DatabaseAgentService(prisma);
  }

  async *streamCompletion(prompt: string): AsyncIterable<string> {
    try {
      // Use the database agent's streaming capability
      for await (const chunk of this.agentService.streamQuery(prompt)) {
        if (chunk) {
          yield chunk;
        }
      }
    } catch (error) {
      console.error('Database Agent error:', error);
      // Fallback response
      yield `Sorry, I encountered an error while accessing the database: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  calculateCost(inputTokens: number, outputTokens: number): number {
    // Database Agent has minimal cost - just the LLM usage
    // Using GPT-4o-mini pricing as base model
    return (inputTokens * 0.00015 + outputTokens * 0.0006) / 1000;
  }

  getMaxTokens(): number {
    // GPT-4o-mini context limit
    return 128000;
  }

  estimateTokens(text: string): number {
    // Simple token estimation similar to OpenAI provider
    const words = text.split(/\s+/).length;
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    return Math.ceil(words * 1.3 + chineseChars);
  }
}