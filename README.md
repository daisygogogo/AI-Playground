# AI Model Playground

A comprehensive AI Model Playground application that allows users to interact with multiple AI models simultaneously, compare responses side-by-side, and manage conversation history.

## 🚀 Features

### Core Functionality
- **Multi-Model Comparison**: Test and compare responses from different AI models (GPT-3.5-turbo, GPT-4o-mini) simultaneously
- **Real-time Streaming**: Live streaming of AI responses with real-time status updates
- **Side-by-Side Interface**: Clean, professional interface showing responses from multiple models in parallel
- **Performance Metrics**: Detailed metrics including token usage, cost calculation, and response time
- **Conversation History**: Save and manage conversation sessions with complete history

### User Experience
- **Modern UI**: Clean, ChatGPT-style interface with dark/light theme support
- **Responsive Design**: Optimized for desktop and mobile devices
- **Markdown Rendering**: Full markdown support with syntax highlighting for code blocks
- **Real-time Status**: Live status indicators (typing, streaming, complete, error)
- **Session Management**: Create, save, and revisit conversation sessions

### Security & Performance
- **Authentication**: Secure JWT-based authentication system
- **Rate Limiting**: Built-in rate limiting (50 requests per hour per user)
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Performance Optimized**: Debounced scrolling, optimized re-renders, and efficient state management

## 🏗️ Project Structure

This repository contains two main projects:

- **Backend** - NestJS API server with Prisma ORM, PostgreSQL, and OpenAI integration
- **Frontend** - Next.js application with TypeScript, Tailwind CSS, and real-time streaming

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn
- OpenAI API Key

### Backend Setup
Navigate to the backend directory and follow the setup instructions:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and OpenAI API key
npx prisma migrate dev
npx prisma generate
npm run start:dev
```
See [Backend README](./backend/README.md) for detailed setup instructions.

### Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```
See [Frontend README](./frontend/README.md) for detailed setup instructions.

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Documentation: http://localhost:4000/api

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt
- **API Documentation**: Swagger/OpenAI
- **Real-time**: Server-Sent Events (SSE)
- **AI Integration**: OpenAI API with provider pattern

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 with shadcn/ui components
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors
- **Rendering**: React Markdown with syntax highlighting
- **Theme**: Dark/light mode with next-themes

## 📁 Repository Structure

```
AI-Playground/
├── backend/          # NestJS API server
│   ├── src/         # Source code
│   ├── prisma/      # Database schema and migrations
│   └── README.md    # Backend documentation
├── frontend/        # Next.js application
│   ├── src/         # Source code
│   ├── public/      # Static assets
│   └── README.md    # Frontend documentation
└── README.md        # This file
```

## 🔧 Development

Both projects can be developed independently. Each has its own package.json and dependencies.

### Environment Configuration

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ai_playground"
JWT_SECRET="your-jwt-secret-key"
OPENAI_API_KEY="your-openai-api-key"
PORT=4000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
