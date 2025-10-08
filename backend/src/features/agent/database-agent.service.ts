import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { createDatabaseTools } from './tools/database-tools';

@Injectable()
export class DatabaseAgentService {
  private agent: any;

  constructor(private readonly prisma: PrismaService) {
    this.initializeAgent();
  }

  private initializeAgent() {
    const tools = createDatabaseTools(this.prisma);
    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.1,
    });

    this.agent = createReactAgent({
      llm,
      tools,
    });
  }

  // async processQuery(query: string): Promise<string> {
  //   try {
  //     console.log('Processing query:', query);
      
  //     const userMsg = new HumanMessage({ content: [{ type: 'text', text: query }] });
  //     const result = await this.agent.invoke({
  //       messages: [userMsg]
  //     });

  //     console.log('Agent result:', result);
  //     const lastMessage = result.messages[result.messages.length - 1];
  //     const content = Array.isArray(lastMessage.content)
  //       ? lastMessage.content.map((c: any) => (typeof c === 'string' ? c : c.text || '')).join('')
  //       : lastMessage.content;
  //     return content;
  //   } catch (error) {
  //     console.error('Detailed error in agent processing:', error);
      
  //     // Log more details about the error
  //     if (error instanceof Error) {
  //       console.error('Error name:', error.name);
  //       console.error('Error message:', error.message);
  //       console.error('Error stack:', error.stack);
  //     }
      
  //     return `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}`;
  //   }
  // }

  async *streamQuery(query: string): AsyncGenerator<string, void, unknown> {
    try {
      const userMsg = new HumanMessage({ content: [{ type: 'text', text: query }] });
      const result = await this.agent.invoke({ messages: [userMsg] });
      const lastMessage = result.messages[result.messages.length - 1];
      const text = Array.isArray(lastMessage.content)
        ? lastMessage.content.map((c: any) => (typeof c === 'string' ? c : c.text || '')).join(' ')
        : String(lastMessage.content || '');
      const words = text.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
        yield chunk;
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    } catch (error) {
      console.error('Error in agent streaming:', error);
      yield `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}