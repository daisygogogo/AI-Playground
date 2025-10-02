import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(value: any = new Date()) {
  if (!value) return "-";
  
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  
  return `${year}/${month}/${day} ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// AI-related utility functions
export function estimateTokens(text: string): number {
  // Simple estimation: 1 English word ≈ 1.3 tokens, 1 Chinese character ≈ 1 token
  const words = text.split(/\s+/).length;
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  return Math.ceil(words * 1.3 + chineseChars);
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(6)}`;
}

export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}