'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              AI Model Playground
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, Guest
              </span>
              <div className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                🟢 Ready
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Card */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Welcome to AI Model Playground</CardTitle>
            <CardDescription>
              Compare response quality, speed, and cost across different AI models. Enter prompts and see real-time parallel responses from multiple models.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Real-time Streaming</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">Watch AI responses unfold word by word</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100">Parallel Comparison</h3>
                <p className="text-sm text-green-700 dark:text-green-300">Compare multiple model responses simultaneously</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Cost Analysis</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">Real-time token usage and cost tracking</p>
              </div>
            </div>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={() => router.push(isAuthenticated() ? '/playground' : '/login')}
              >
                Start Using AI Playground
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GPT-3.5-turbo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Model Response Area
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Status: Ready</span>
                  <span>Cost: $0.000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GPT-4o-mini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Model Response Area
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Status: Ready</span>
                  <span>Cost: $0.000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Metrics Analysis Area
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Response time, cost comparison, etc.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
