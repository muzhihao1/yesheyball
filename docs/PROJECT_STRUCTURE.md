# Chinese 8-Ball Billiards Training Platform - Project Structure

## Overview
A comprehensive billiards training platform with AI-powered coaching, progress tracking, and adaptive learning system.

## Architecture
```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (routes)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and helpers
│   │   └── data/           # Static data and configurations
│   └── index.html
├── server/                 # Express.js backend application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations interface
│   ├── auth.ts             # Session authentication middleware
│   ├── db.ts               # Database connection setup
│   ├── experienceSystem.ts # User progression logic
│   ├── levelSystem.ts      # Level requirements and unlocks
│   ├── openai.ts           # AI coaching integration
│   ├── imageAnalyzer.ts    # Image analysis for exercises
│   └── upload.ts           # File upload handling
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and types
├── assessments/            # Level-based skill assessments
└── attached_assets/        # User-uploaded training images
```

## Key Features

### Frontend (React + TypeScript)
- **Authentication**: Session-based email login with optional access code
- **Responsive Design**: Mobile-first billiards training interface
- **Real-time Progress**: Live experience tracking and level progression
- **Interactive Components**: Exercise validation and feedback modals
- **Routing**: Multi-page application with protected routes

- **RESTful API**: Comprehensive training data management served via serverless Express on Vercel
- **AI Integration**: OpenAI-powered coaching feedback
- **Image Analysis**: Exercise validation through computer vision
- **Experience System**: Gamified progression tracking
- **Adaptive Learning**: Personalized training recommendations

### Database Schema
- **Users**: Profile and authentication data
- **Training Sessions**: Exercise completion records
- **Experience Tracking**: Level progression and achievements
- **Diary Entries**: Training reflection and insights
- **Tasks**: Daily challenges and objectives

## Code Quality Standards

### File Organization
- Components grouped by functionality
- Clear separation of concerns
- Consistent naming conventions
- Proper TypeScript typing throughout

### API Design
- RESTful endpoints with proper HTTP methods
- Comprehensive error handling
- Input validation using Zod schemas
- Consistent response formats

### Authentication & Security
- Secure session management
- Protected routes and middleware
- Input sanitization and validation
- Environment variable management

## Development Workflow
1. **Frontend Development**: React components with TypeScript
2. **Backend Development**: Express routes with database integration  
3. **Database Migrations**: Drizzle ORM schema updates
4. **Testing**: Manual testing with real user scenarios
5. **Deployment**: GitHub → Vercel with automatic preview and production deployments

## Key Technologies
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js, PostgreSQL
- **Database**: Drizzle ORM with PostgreSQL
- **AI/ML**: OpenAI API for coaching feedback
- **Authentication**: Replit OAuth
- **File Upload**: Multer for image processing
- **UI Components**: shadcn/ui component library
