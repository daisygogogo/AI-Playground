# AI Playground Backend

A robust NestJS backend API for the AI Model Playground, providing authentication, real-time AI model interaction, and conversation management.

## 🚀 Features

### Core API Features
- **RESTful API**: Well-structured REST endpoints with OpenAPI documentation
- **Real-time Streaming**: Server-Sent Events (SSE) for live AI model responses
- **Multi-Model Support**: Concurrent processing of multiple AI models
- **Authentication**: JWT-based secure authentication system
- **Rate Limiting**: Built-in request rate limiting for API protection

### AI Integration
- **OpenAI Integration**: Direct integration with OpenAI GPT models
- **Provider Pattern**: Extensible architecture for adding new AI providers
- **Streaming Responses**: Real-time chunk-by-chunk response streaming
- **Token Estimation**: Accurate token counting and cost calculation
- **Performance Metrics**: Response time tracking and performance analytics

### Data Management
- **PostgreSQL Database**: Robust data persistence with ACID compliance
- **Prisma ORM**: Type-safe database operations with migrations
- **Session Management**: Complete conversation history storage
- **User Management**: Secure user registration and profile management
- **Cost Tracking**: Detailed usage and cost analytics per user

## 🛠️ Tech Stack

### Core Framework
- **NestJS**: Progressive Node.js framework for scalable applications
- **TypeScript**: Full type safety and modern JavaScript features
- **Node.js**: Runtime environment with latest LTS version

### Database & ORM
- **PostgreSQL**: Advanced open-source relational database
- **Prisma**: Next-generation ORM with type safety
- **Database Migrations**: Version-controlled schema changes

### Authentication & Security
- **JWT**: JSON Web Tokens for stateless authentication
- **bcrypt**: Secure password hashing
- **Passport**: Authentication middleware
- **CORS**: Cross-origin resource sharing configuration

### AI & External APIs
- **OpenAI API**: GPT model integration
- **Axios**: HTTP client for external API calls
- **Rate Limiting**: Express rate limit middleware

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn
- OpenAI API Key

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
   
   # CORS
   CORS_ORIGIN="http://localhost:3000"
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

### Testing
```bash
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run test:cov       # Run tests with coverage
npm run test:watch     # Run tests in watch mode
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
POST /auth/refresh      # Refresh JWT token
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

```typescript
// SSE endpoint
GET /playground/stream?prompt=Hello&models=gpt-3.5-turbo,gpt-4o-mini&token=jwt-token

// Event types returned:
{
  "type": "session",
  "sessionId": "session-uuid"
}

{
  "type": "status", 
  "model": "gpt-3.5-turbo",
  "status": "streaming"
}

{
  "type": "chunk",
  "model": "gpt-3.5-turbo", 
  "content": "Hello! How can I help you today?",
  "timestamp": 1640995200000
}

{
  "type": "metrics",
  "model": "gpt-3.5-turbo",
  "tokensUsed": 25,
  "cost": 0.00005,
  "responseTime": 1500
}
```

### Rate Limiting
- **50 requests per hour per user**
- **Configurable limits per route**
- **Automatic reset timer**
- **User-friendly error messages**

## 🔒 Security Features

### Authentication
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Password Hashing**: bcrypt with salt rounds for secure storage
- **Protected Routes**: Guard-based route protection
- **Token Refresh**: Automatic token renewal system

### Data Protection
- **Input Validation**: Comprehensive validation using class-validator
- **SQL Injection Prevention**: Prisma ORM prevents SQL injection
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents abuse and DDoS attacks

## 🧩 Module Documentation

### Authentication Module (`auth/`)
Handles user authentication and authorization:

```typescript
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### Playground Module (`playground/`)
Core AI playground functionality:

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [PlaygroundController],
  providers: [
    PlaygroundService,
    OpenAIProvider,
    PlaygroundAuthGuard,
    RateLimitGuard,
  ],
})
export class PlaygroundModule {}
```

### OpenAI Provider (`providers/openai.provider.ts`)
AI model integration with provider pattern:

```typescript
export class OpenAIProvider {
  private openai: OpenAI;
  
  constructor(private modelName: string) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async *streamCompletion(prompt: string): AsyncGenerator<string> {
    const stream = await this.openai.chat.completions.create({
      model: this.modelName,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) yield content;
    }
  }
}
```

## 🧪 Testing

### Unit Tests
```bash
npm run test              # Run all unit tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Run tests with coverage
```

### Integration Tests
```bash
npm run test:e2e          # Run end-to-end tests
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker Deployment
```bash
# Build image
docker build -t ai-playground-backend .

# Run container
docker run -p 4000:4000 ai-playground-backend
```

### Environment Setup
```env
NODE_ENV=production
DATABASE_URL="your-production-db-url"
JWT_SECRET="your-production-jwt-secret"
OPENAI_API_KEY="your-openai-api-key"
```

### Database Migration
```bash
npx prisma migrate deploy
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL is running
   sudo service postgresql status
   
   # Verify connection string
   npx prisma db pull
   ```

2. **OpenAI API Errors**
   ```bash
   # Verify API key
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models
   ```

3. **JWT Token Issues**
   ```bash
   # Check JWT secret configuration
   node -e "console.log(require('jsonwebtoken').verify('token', 'secret'))"
   ```

4. **Rate Limiting Too Strict**
   - Adjust `RATE_LIMIT_MAX_REQUESTS` in environment
   - Check user session counting logic
   - Verify rate limit window configuration

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Install dependencies: `npm install`
4. Setup environment: `cp .env.example .env`
5. Run migrations: `npx prisma migrate dev`
6. Start development: `npm run start:dev`

### Code Guidelines
- Follow NestJS best practices
- Use TypeScript for type safety
- Write comprehensive tests
- Document API endpoints
- Follow conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
