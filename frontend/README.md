# Task Management Frontend

A modern React-based task management application built with Vite, TypeScript, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query + Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API service functions
├── hooks/         # Custom React hooks
├── stores/        # Zustand stores
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── lib/           # Configuration and setup files
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## API Configuration

The application is configured to connect to the backend API at `http://localhost:8087`. This can be modified in `src/services/api.ts`.

## Features

- Clean, minimalistic black and white design
- Responsive layout for all screen sizes
- Type-safe API integration
- Modern React patterns and best practices
- Optimized build with code splitting