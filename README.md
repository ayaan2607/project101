# Aethera Hub - Centralized Academic Resource Management System

Aethera Hub is a comprehensive web-based platform designed for students and faculty to discover, organize, search, and manage academic resources in one centralized place.

## Features
- **Resource Explorer**: Search and filter academic materials by subject, type, and semester.
- **AI Academic Assistant**: Get smart recommendations and study paths based on natural language queries (Powered by Gemini).
- **Bookmarks**: Save important resources for quick access later.
- **Admin Dashboard**: Manage resources and subjects directly from the interface.
- **Rich Dashboard**: View statistics, trending resources, and recently added materials.

## Tech Stack
- React 18 + Vite
- TypeScript
- Tailwind CSS
- React Router
- Supabase (PostgreSQL) - Ready for integration
- Gemini API (AI Assistant)

## Project Architecture
- `src/components`: Reusable UI components and layouts.
- `src/pages`: Main application views (Home, Resources, Bookmarks, Admin, AIAssistant).
- `src/types`: TypeScript definitions.
- `src/data`: Mock data for the MVP demo.
- `src/lib`: Utilities and service configurations.

## Database Schema (Planned)
The application is designed to work with the following Supabase PostgreSQL schema:

```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id),
  branch TEXT NOT NULL,
  semester TEXT NOT NULL,
  resource_url TEXT NOT NULL,
  tags TEXT[],
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views INTEGER DEFAULT 0
);

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- references auth.users
  resource_id UUID REFERENCES resources(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## How to Run Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your Supabase and Gemini keys.
4. Run the development server:
   ```bash
   npm run dev
   ```

## Future Scope
- Full Supabase Auth integration (Student/Faculty roles).
- Real-time PDF preview and annotation.
- Advanced analytics for professors to track resource effectiveness.
- Peer-to-peer resource rating system.
