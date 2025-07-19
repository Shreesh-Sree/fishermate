# Project Structure

## Overview
This document outlines the clean, organized structure of the MatsyaN QuarkVerse project.

## Directory Structure

```
/workspaces/MatsyaN-QuarkVerse/
├── docs/                    # Documentation files
│   ├── setup/              # Setup guides
│   ├── troubleshooting/    # Troubleshooting guides
│   └── blueprint.md        # Project blueprint
├── public/                 # Static assets
│   ├── favicon.ico         # Site favicon
│   ├── favicon.svg         # SVG favicon
│   └── apple-touch-icon.svg
├── src/                    # Source code
│   ├── ai/                 # AI-related functionality
│   │   ├── flows/          # AI flow implementations
│   │   ├── dev.ts          # Development utilities
│   │   └── genkit.ts       # Genkit configuration
│   ├── app/                # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── chat/           # Chat page
│   │   ├── dashboard/      # Dashboard page
│   │   ├── laws/           # Fishing laws page
│   │   ├── login/          # Login page
│   │   ├── map/            # Map page
│   │   ├── safety/         # Safety page
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Homepage
│   │   ├── actions.ts      # Server actions
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── ui/             # Reusable UI components
│   │   └── *.tsx           # Feature-specific components
│   ├── constants/          # Application constants
│   │   ├── translations.ts # Translations
│   │   └── index.ts        # Barrel export
│   ├── context/            # React contexts
│   │   ├── AuthContext.tsx
│   │   └── LanguageContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── types.ts        # AI types
│   │   └── index.ts        # Barrel export
│   └── utils/              # Utility functions
│       ├── utils.ts        # General utilities
│       ├── data.ts         # Data utilities
│       ├── firebase.ts     # Firebase configuration
│       └── index.ts        # Barrel export
├── apphosting.yaml         # App hosting configuration
├── components.json         # shadcn/ui configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── README.md               # Project README
└── SECURITY.md             # Security policy
```

## Key Improvements Made

1. **Removed Duplicate Files**: Cleaned up duplicate weather card components and outdated documentation files
2. **Organized Directory Structure**: Created logical groupings for types, constants, and utilities
3. **Better Import Organization**: Added index.ts files for cleaner imports
4. **Moved Assets**: Moved favicon to the public directory where it belongs
5. **Consolidated Functionality**: Grouped related files together for easier navigation

## Development Guidelines

- Use barrel exports (`index.ts` files) for cleaner imports
- Keep components organized by feature or UI type
- Place all static assets in the `public` directory
- Use the `constants` directory for application-wide constants
- Use the `types` directory for TypeScript definitions
- Use the `utils` directory for utility functions and configurations

## Debugging Tips

With this clean structure:
- Components are easy to locate in the `components/` directory
- Types are centralized in `src/types/`
- Utilities are organized in `src/utils/`
- Constants are in one place at `src/constants/`
- Each directory has clear barrel exports for easier imports
