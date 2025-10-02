# AI Playground Frontend

A modern Next.js frontend application for the AI Model Playground, providing a sleek interface for comparing AI model responses in real-time.

## 🚀 Features

### User Interface
- **ChatGPT-style Interface**: Clean, modern design inspired by ChatGPT
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Status**: Live indicators for model response status
- **Side-by-Side Comparison**: Compare multiple AI models simultaneously

### Functionality
- **Real-time Streaming**: Live streaming of AI responses using Server-Sent Events
- **Markdown Rendering**: Full markdown support with syntax highlighting
- **Conversation History**: Browse and manage previous conversations
- **Session Management**: Create, save, and restore conversation sessions
- **Performance Metrics**: Display token usage, cost, and response time
- **Error Handling**: User-friendly error messages and rate limit notifications

### Performance
- **Optimized Rendering**: Debounced scrolling and efficient re-renders
- **State Management**: Zustand for performant state management
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component for optimized loading

## 🛠️ Tech Stack

### Core Framework
- **Next.js 14+**: React framework with App Router
- **React 19+**: Latest React with concurrent features
- **TypeScript**: Full type safety and IntelliSense

### Styling & UI
- **Tailwind CSS v3**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible UI components
- **Lucide React**: Modern icon library
- **next-themes**: Theme management with system preference

### State & Data
- **Zustand**: Lightweight state management
- **Axios**: HTTP client with interceptors
- **React Markdown**: Markdown rendering with plugins
- **Server-Sent Events**: Real-time communication

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or later
- npm, yarn, or pnpm
- Running backend API server

### Installation

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

3. **Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Type Checking
```bash
npm run type-check   # Run TypeScript compiler check
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── playground/        # Main playground interface
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── auth/             # Authentication components
│   │   ├── playground/       # Playground-specific components
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Authentication hook
│   │   ├── useSSEStream.ts   # Server-Sent Events hook
│   │   └── useTheme.ts       # Theme management hook
│   ├── stores/               # Zustand stores
│   │   ├── authStore.ts      # Authentication state
│   │   └── playgroundStore.ts # Playground state
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── lib/                  # Library configurations
├── public/                   # Static assets
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎨 Styling Guide

### Theme Support
The application supports both light and dark themes:
- **System Preference**: Automatically detects user's system theme
- **Manual Toggle**: Users can manually switch themes
- **Persistence**: Theme preference is saved in localStorage

### Component Library
Using shadcn/ui components for consistency:
- **Button**: Various button styles and sizes
- **Input**: Form inputs with validation states
- **Card**: Content containers
- **Dialog**: Modal dialogs
- **Textarea**: Multi-line text inputs

## 🔗 API Integration

### Authentication
```typescript
// Login request
POST /auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Response
{
  "access_token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Real-time Streaming
```typescript
// SSE endpoint for AI model streaming
GET /playground/stream?prompt=Hello&models=gpt-3.5-turbo,gpt-4o-mini&token=jwt-token

// Event types:
// - chunk: AI response content
// - status: Model status updates
// - metrics: Performance metrics
// - session: Session information
```

## 🧩 Key Components

### `PlaygroundPage`
Main playground interface component:
- Manages conversation state
- Handles real-time streaming
- Renders side-by-side model responses

### `PromptInput`
Text input component for user prompts:
- Auto-resize functionality
- Submit on Enter (Shift+Enter for new line)
- Loading states and validation

### `ModelResponse`
Displays AI model responses:
- Markdown rendering with syntax highlighting
- Status indicators (typing, streaming, complete, error)
- Performance metrics display

### `MarkdownRenderer`
Custom markdown renderer:
- Syntax highlighting for code blocks
- Theme-aware styling
- Custom link and image handling

## 🔍 Performance Optimization

### Rendering Optimization
- **useMemo**: Expensive calculations cached
- **useCallback**: Event handlers memoized
- **debouncing**: Scroll events debounced
- **Lazy Loading**: Components loaded on demand

### Bundle Optimization
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code eliminated
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Next.js Font optimization

## 🐛 Troubleshooting

### Common Issues

1. **Development Server Won't Start**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall
   - Check port 3000 availability

2. **API Connection Issues**
   - Verify backend server is running
   - Check NEXT_PUBLIC_API_URL in .env.local
   - Verify CORS settings on backend

3. **Theme Not Working**
   - Clear localStorage
   - Check next-themes configuration
   - Verify CSS variables are defined

4. **Streaming Not Working**
   - Check network connectivity
   - Verify authentication token
   - Check browser SSE support

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Deployment Platforms
- **Vercel**: Recommended for Next.js apps
- **Netlify**: Static site deployment
- **Docker**: Containerized deployment
- **AWS/GCP**: Cloud platform deployment

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Run linting: `npm run lint`
5. Commit changes: `git commit -m 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Create Pull Request

### Code Style
- Follow ESLint configuration
- Use TypeScript for type safety
- Write component documentation
- Include unit tests for utilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
