# AI Model Playground

A comprehensive AI Model Playground application that allows users to interact with multiple AI models simultaneously, compare responses side-by-side, and manage conversation history.

### Access the Application
- Frontend: https://ai-playground-blond.vercel.app/
- Here’s the account you can use to login:  test@example.com , password: 123456

#

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn
- OpenAI API Key

### Backend Setup
See [Backend README](./backend/README.md) for detailed setup instructions.

### Frontend Setup
See [Frontend README](./frontend/README.md) for detailed setup instructions.


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
