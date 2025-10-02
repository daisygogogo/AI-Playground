import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AIProvider, TokenUsage } from './base.provider';

@Injectable()
export class OpenAIProvider implements AIProvider {
  private openai: OpenAI;
  private model: string;
  private pricing: { input: number; output: number };

  constructor(model: string = 'gpt-3.5-turbo') {
    this.model = model;
    this.name = model;
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'demo-key-for-testing',
    });

    // Set pricing based on model
    this.pricing = this.getModelPricing(model);
  }

  name: string;

  async *streamCompletion(prompt: string): AsyncIterable<string> {
    try {
      // If no API key, use mock responses
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key-for-testing') {
        console.log(`Using mock response for ${this.model}`);
        yield* this.getMockStreamResponse(prompt);
        return;
      }

      console.log(`Calling OpenAI API for ${this.model}`);
      
      const stream = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error(`Error calling OpenAI API for ${this.model}:`, error instanceof Error ? error.message : 'Unknown error');
      // Fallback to mock response on error
      yield* this.getMockStreamResponse(prompt);
    }
  }

  private async *getMockStreamResponse(prompt: string): AsyncIterable<string> {
    const responses = {
      'gpt-3.5-turbo': `As GPT-3.5 Turbo, I'll answer your question: "${prompt}".

This is an interesting question. I think we can analyze it from several perspectives:

1. **Technical Perspective**: This involves current technology development trends
2. **Practical Perspective**: We need to consider feasibility in real-world applications
3. **Future Outlook**: This field has great potential for development

Overall, this is a topic worth deep consideration, and I hope my answer is helpful to you.`,

      'gpt-4o-mini': `As GPT-4o Mini, I'll provide a detailed answer to: "${prompt}".

Let me analyze this question from a deeper perspective:

## Key Points
- **Core Concepts**: First, we need to understand the fundamental principles
- **Practical Applications**: How to implement this in reality
- **Potential Challenges**: Possible difficulties and solutions

## Detailed Analysis
This question involves considerations from multiple dimensions. From a technical implementation perspective, we need to comprehensively consider efficiency, cost, and maintainability.

## Recommendations
Based on current technology development trends, I recommend taking a progressive approach to handle this issue.

I hope this answer provides you with valuable insights!`
    };

    const response = responses[this.model] || responses['gpt-3.5-turbo'];
    const words = response.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
      yield chunk;
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }
  }

  calculateCost(inputTokens: number, outputTokens: number): number {
    return (inputTokens * this.pricing.input + outputTokens * this.pricing.output) / 1000;
  }

  getMaxTokens(): number {
    return this.model.includes('gpt-4') ? 8192 : 4096;
  }

  estimateTokens(text: string): number {
    // Simple token estimation: ~4 chars per token for English, ~1 token per Chinese character
    const words = text.split(/\s+/).length;
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    return Math.ceil(words * 1.3 + chineseChars);
  }

  private getModelPricing(model: string): { input: number; output: number } {
    const pricing = {
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
    };

    return pricing[model] || pricing['gpt-3.5-turbo'];
  }
}