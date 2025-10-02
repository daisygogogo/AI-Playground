# AI Playground Backend

A robust NestJS backend API for the AI Model Playground, providing authentication, real-time AI model interaction, and conversation management.

## 🚀 Features

### Core API Features
- **RESTful API**: Well-structured REST endpoints with OpenAPI documentation
- **Real-time Streaming**: Server-Sent Events (SSE) for live AI model responses
- **Multi-Model Support**: Concurrent processing of multiple AI models
- **Authentication**: JWT-based secure authentication system
- **Rate Limiting**: Built-in request rate limiting for API protection

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_playground"
   
   # JWT
   JWT_SECRET="your-super-secure-jwt-secret-key"
   JWT_EXPIRES_IN="7d"
   
   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"
   
   # Server
   PORT=4000
   NODE_ENV="development"
  
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed database
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   # or
   yarn start:dev
   ```

5. **Verify Installation**
   - API: http://localhost:4000
   - API Documentation: http://localhost:4000/api
   - Health Check: http://localhost:4000/health

## 🔧 Available Scripts

### Development
```bash
npm run start:dev       # Start in development mode with hot reload
npm run start:debug     # Start in debug mode
npm run start:prod      # Start in production mode
```

### Building
```bash
npm run build          # Build the application
npm run prebuild       # Clean build directory
```

### Database
```bash
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations in development
npx prisma migrate prod # Run migrations in production
npx prisma db push     # Push schema changes
npx prisma db seed     # Seed database
npx prisma studio      # Open Prisma Studio
```

## 📊 Database Schema

### Core Entities

#### User
```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  password    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  sessions    AISession[]
}
```

#### AISession
```prisma
model AISession {
  id            String   @id @default(cuid())
  userId        String
  prompt        String
  models        String[]
  status        SessionStatus
  totalCost     Float    @default(0)
  totalTokens   Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id])
  conversations AIConversation[]
}
```

#### AIConversation
```prisma
model AIConversation {
  id           String    @id @default(cuid())
  sessionId    String
  modelName    String
  userPrompt   String
  response     String
  inputTokens  Int
  outputTokens Int
  cost         Float
  responseTime Int
  status       ConversationStatus
  createdAt    DateTime  @default(now())
  session      AISession @relation(fields: [sessionId], references: [id])
}
```

## 🔌 API Endpoints

### Authentication
```http
POST /auth/register     # User registration
POST /auth/login        # User login
GET  /auth/profile      # Get user profile
```

### Playground
```http
GET  /playground/stream              # SSE endpoint for AI streaming
GET  /playground/sessions           # Get user sessions
GET  /playground/sessions/:id       # Get specific session
DELETE /playground/sessions/:id     # Delete session
```

## 🔄 Real-time Streaming

### Server-Sent Events (SSE)
The playground uses SSE for real-time AI model responses:


### Rate Limiting
- **50 requests per hour per user**
- **Configurable limits per route**
- **Automatic reset timer**
- **User-friendly error messages**


## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Database Migration
```bash
npx prisma migrate deploy
```



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
