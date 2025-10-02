# AI Playground Frontend

A modern Next.js frontend application for the AI Model Playground, providing a sleek interface for comparing AI model responses in real-time.

## 🚀 Features

### User Interface
- **ChatGPT-style Interface**: Clean, modern design inspired by ChatGPT
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Status**: Live indicators for model response status
- **Side-by-Side Comparison**: Compare multiple AI models simultaneously


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


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
