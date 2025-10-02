export interface AIProvider {
  name: string;
  streamCompletion(prompt: string): AsyncIterable<string>;
  calculateCost(inputTokens: number, outputTokens: number): number;
  getMaxTokens(): number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}