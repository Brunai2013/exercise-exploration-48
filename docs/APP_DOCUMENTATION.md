
# FitTrack - Comprehensive Application Documentation

## Table of Contents
1. [Application Overview](#application-overview)
2. [Technical Stack](#technical-stack)
3. [Database Architecture](#database-architecture)
4. [Application Structure](#application-structure)
5. [Core Features](#core-features)
6. [Pages & Components](#pages--components)
7. [Data Models](#data-models)
8. [Hooks & State Management](#hooks--state-management)
9. [File Storage & Images](#file-storage--images)
10. [UI/UX Design](#uiux-design)
11. [Routing](#routing)
12. [Development Setup](#development-setup)

---

## Application Overview

### Goal
FitTrack is a comprehensive fitness tracking web application that allows users to manage exercise libraries, create custom workouts, track workout sessions, and monitor fitness progress over time.

### Core Purpose
- **Exercise Library Management**: Create, edit, and organize exercises with images and categories
- **Workout Planning**: Design custom workouts with multiple exercises and sets
- **Workout Execution**: Guide users through workout sessions with real-time tracking
- **Progress Monitoring**: Track workout history and performance metrics
- **Data Persistence**: Offline-first approach with cloud synchronization

---

## Technical Stack

### Frontend Framework
- **React 18.3.1** with TypeScript
- **Vite** as build tool
- **Tailwind CSS** for styling
- **Shadcn/ui** component library

### State Management
- **TanStack React Query** for server state management
- **React Hooks** for local state management
- **Context API** for global state (minimal usage)

### Database & Backend
- **Supabase** as primary backend service
- **IndexedDB** for offline storage and caching
- **PostgreSQL** (via Supabase) for persistent data

### Key Libraries
- **@dnd-kit** for drag-and-drop functionality
- **date-fns** for date manipulation
- **lucide-react** for icons
- **react-router-dom** for routing
- **react-helmet** for page metadata
- **sonner** for toast notifications

---

## Database Architecture

### Supabase Tables

#### exercises
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### workouts
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]',
  completed BOOLEAN DEFAULT FALSE,
  progress INTEGER DEFAULT 0,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### IndexedDB Structure
- **Store Names**: `exercises`, `categories`, `workouts`
- **Indexes**: 
  - `exercises.category` for filtering
  - `workouts.date` for date-based queries
- **Purpose**: Offline caching and fallback storage

---

## Application Structure

### Project File Tree
```
src/
├── components/
│   ├── exercises/
│   │   ├── ExerciseLibraryHeader.tsx
│   │   ├── ExerciseContent.tsx
│   │   ├── ExerciseGrid.tsx
│   │   ├── ExerciseCard.tsx
│   │   ├── FilterSection.tsx
│   │   ├── SearchBar.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── AlphabeticalFilter.tsx
│   │   ├── CategoryManager.tsx
│   │   └── ExerciseDialogs.tsx
│   ├── workout/
│   │   ├── WorkoutFormContent.tsx
│   │   ├── WorkoutBasicInfoForm.tsx
│   │   ├── WorkoutExerciseList.tsx
│   │   ├── ExerciseSearch.tsx
│   │   ├── SortableExerciseItem.tsx
│   │   ├── ExerciseSetForm.tsx
│   │   ├── ExerciseGroupCard.tsx
│   │   └── exercise-card/
│   │       ├── ExerciseWorkoutCard.tsx
│   │       ├── ExerciseCardHeader.tsx
│   │       ├── ExerciseSetsGrid.tsx
│   │       └── ExerciseSetRow.tsx
│   ├── workout-session/
│   │   ├── ExerciseGrid.tsx
│   │   ├── WorkoutHeader.tsx
│   │   ├── WorkoutProgress.tsx
│   │   └── SessionControls.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── PageContainer.tsx
│   │   └── SectionHeader.tsx
│   └── ui/ (Shadcn components)
├── hooks/
│   ├── exercise/
│   │   ├── useExerciseQueries.tsx
│   │   ├── useExerciseFilters.tsx
│   │   ├── useExerciseMutations.tsx
│   │   ├── useExerciseDialogs.tsx
│   │   ├── useClearExercises.tsx
│   │   └── useBulkUrlUpdate.tsx
│   ├── workout/
│   │   ├── useWorkoutForm.tsx
│   │   ├── useWorkoutFormState.tsx
│   │   ├── useExerciseManagement.tsx
│   │   ├── useExerciseSets.tsx
│   │   ├── useCategoryData.tsx
│   │   └── useSaveWorkout.tsx
│   ├── useExerciseData.tsx
│   ├── useCategoryData.tsx
│   └── use-mobile.ts
├── lib/
│   ├── workout/
│   │   ├── index.ts
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   ├── utils.ts
│   │   ├── recent-queries.ts
│   │   ├── upcoming-queries.ts
│   │   ├── date-queries.ts
│   │   ├── general-queries.ts
│   │   └── metrics-queries.ts
│   ├── db.ts
│   ├── exercises.ts
│   ├── categories.ts
│   ├── workouts.ts
│   ├── storage.ts
│   ├── types.ts
│   ├── defaultData.ts
│   └── utils.ts
├── pages/
│   ├── Index.tsx
│   ├── ExerciseLibrary.tsx
│   ├── WorkoutForm.tsx
│   ├── WorkoutSession.tsx
│   ├── WorkoutHistory.tsx
│   ├── WorkoutMetrics.tsx
│   ├── Calendar.tsx
│   ├── DataBackup.tsx
│   └── NotFound.tsx
├── integrations/
│   └── supabase/
│       └── client.ts
└── App.tsx
```

---

## Core Features

### 1. Exercise Library Management
- **CRUD Operations**: Create, read, update, delete exercises
- **Image Management**: Upload and display exercise images
- **Categorization**: Organize exercises by muscle groups/types
- **Search & Filter**: Real-time search and category filtering
- **Bulk Operations**: Import multiple exercises, bulk URL fixes
- **Offline Support**: IndexedDB caching for offline access

### 2. Workout Planning
- **Workout Builder**: Visual drag-and-drop workout creation
- **Exercise Selection**: Search and add exercises from library
- **Set Configuration**: Define sets, reps, and weights
- **Workout Templates**: Save and reuse workout configurations
- **Exercise Grouping**: Create supersets and circuits
- **Date Scheduling**: Schedule workouts for specific dates

### 3. Workout Session Management
- **Real-time Tracking**: Track sets, reps, and weights during workouts
- **Progress Indicators**: Visual feedback on workout completion
- **Exercise Navigation**: Quick navigation between exercises
- **Rest Timers**: Built-in rest period tracking
- **Session History**: Automatic saving of workout sessions

### 4. Data Management & Backup
- **Cloud Sync**: Automatic synchronization with Supabase
- **Local Backup**: IndexedDB for offline functionality
- **Data Export**: JSON export for backup purposes
- **Data Import**: Restore from backup files
- **Data Validation**: Ensure data integrity across operations

---

## Pages & Components

### Pages Overview

#### 1. Index (`/`)
- **Purpose**: Dashboard and landing page
- **Features**: Quick access to recent workouts, statistics
- **Components**: Dashboard cards, quick action buttons

#### 2. Exercise Library (`/exercise-library`)
- **Purpose**: Manage exercise database
- **Features**: 
  - Grid view of exercises with images
  - Advanced filtering (search, category, alphabetical)
  - Add/edit/delete exercises
  - Category management
  - Bulk operations
- **Key Components**:
  - `ExerciseLibraryHeader`: Action buttons and title
  - `FilterSection`: Search and filter controls
  - `ExerciseGrid`: Grid layout of exercise cards
  - `CategoryManager`: Category CRUD operations

#### 3. Workout Form (`/workout/new`, `/workout/:id`)
- **Purpose**: Create and edit workouts
- **Features**:
  - Basic info form (name, description, date)
  - Exercise selection from library
  - Set configuration
  - Drag-and-drop reordering
- **Key Components**:
  - `WorkoutBasicInfoForm`: Workout metadata
  - `WorkoutExerciseList`: Sortable exercise list
  - `ExerciseSearch`: Exercise selection panel

#### 4. Workout Session (`/workout-session/:id`)
- **Purpose**: Execute and track workouts
- **Features**:
  - Real-time set tracking
  - Progress indicators
  - Exercise grouping (supersets/circuits)
  - Session timer
- **Key Components**:
  - `ExerciseGrid`: Session-specific exercise display
  - `ExerciseWorkoutCard`: Individual exercise tracking
  - `ExerciseGroupCard`: Grouped exercise tracking

#### 5. Workout History (`/workout-history`)
- **Purpose**: View past workout sessions
- **Features**: Historical data, filtering, statistics

#### 6. Calendar (`/calendar`)
- **Purpose**: Schedule and view workouts by date
- **Features**: Monthly view, workout scheduling

#### 7. Metrics (`/workout-metrics`)
- **Purpose**: Analytics and progress tracking
- **Features**: Charts, statistics, progress visualization

#### 8. Data Backup (`/backup`)
- **Purpose**: Data management and backup
- **Features**: Export/import functionality

---

## Data Models

### Exercise Interface
```typescript
interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  imagePath?: string; // For file uploads
}
```

### Category Interface
```typescript
interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color class
}
```

### Workout System
```typescript
interface ExerciseSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  targetReps: number;
  actualReps?: number;
  weight?: number;
  completed: boolean;
  notes?: string;
}

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: ExerciseSet[];
  order: number;
}

interface Workout {
  id: string;
  name: string;
  description?: string;
  date: string; // ISO format (yyyy-MM-dd)
  exercises: WorkoutExercise[];
  completed: boolean;
  progress?: number; // 0-100 percentage
  archived?: boolean;
}
```

### Exercise Grouping (Visual Only)
```typescript
interface ExerciseGroup {
  id: string;
  type: 'superset' | 'circuit';
  exerciseIds: string[];
}
```

---

## Hooks & State Management

### Query Hooks
- **`useExerciseQueries`**: Fetch exercises and categories
- **`useWorkoutQueries`**: Fetch workout data
- **React Query Configuration**:
  - 5-minute stale time for exercises
  - 10-minute stale time for categories
  - Automatic retry (3 attempts)
  - Background refetch on window focus

### Mutation Hooks
- **`useExerciseMutations`**: Exercise CRUD operations
- **`useWorkoutMutations`**: Workout CRUD operations
- **Optimistic Updates**: Immediate UI updates with rollback on error

### Filter & Search Hooks
- **`useExerciseFilters`**: Real-time filtering logic
- **`useWorkoutFilters`**: Workout filtering and sorting

### Form Management Hooks
- **`useWorkoutForm`**: Complete workout form state management
- **`useWorkoutFormState`**: Core form state
- **`useExerciseManagement`**: Exercise selection and ordering
- **`useExerciseSets`**: Set configuration management

---

## File Storage & Images

### Image URL Management
- **Storage**: Supabase Storage buckets
- **URL Correction**: Automatic URL formatting for consistency
- **Fallbacks**: Graceful handling of missing images
- **Upload Process**: Direct upload to Supabase with automatic URL generation

### Image URL Correction System
```typescript
// Ensures consistent URL format
const ensureFullImageUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${SUPABASE_URL}/storage/v1/object/public/${url}`;
};
```

---

## UI/UX Design

### Design System
- **Color Scheme**: 
  - Primary: Indigo/Purple gradient
  - Secondary: Teal accents
  - Background: White with subtle gradients
- **Typography**: System font stack with clear hierarchy
- **Spacing**: Consistent 4px grid system
- **Border Radius**: Rounded corners (0.5rem standard)

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: 
  - Mobile: < 768px (single column)
  - Desktop: ≥ 768px (multi-column layouts)
- **Touch Targets**: Minimum 44px for interactive elements

### Component Patterns
- **Cards**: Primary content containers with shadow
- **Buttons**: Gradient primary, outline secondary
- **Forms**: Floating labels, validation states
- **Modals**: Overlay dialogs for forms and confirmations
- **Toast Notifications**: Non-intrusive feedback

### Layout Structure
```
┌─────────────────────────────────────┐
│ Navbar (Fixed Top)                  │
├─────────────────────────────────────┤
│ PageContainer                       │
│ ┌─────────────────────────────────┐ │
│ │ SectionHeader                   │ │
│ │ ├─ Title                        │ │
│ │ ├─ Description                  │ │
│ │ └─ Action Buttons               │ │
│ ├─────────────────────────────────┤ │
│ │ Page Content                    │ │
│ │ ├─ Filters (if applicable)      │ │
│ │ ├─ Main Content Area            │ │
│ │ └─ Side Panel (if applicable)   │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Routing

### Route Configuration
```typescript
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/exercise-library" element={<ExerciseLibrary />} />
  <Route path="/calendar" element={<Calendar />} />
  <Route path="/workout/new" element={<WorkoutForm />} />
  <Route path="/workout/:id" element={<WorkoutForm />} />
  <Route path="/workout-session/:id" element={<WorkoutSession />} />
  <Route path="/workout-history" element={<WorkoutHistory />} />
  <Route path="/workout-metrics" element={<WorkoutMetrics />} />
  <Route path="/backup" element={<DataBackup />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Navigation Structure
- **Top Navigation**: Always visible navbar with main sections
- **Breadcrumbs**: Context-aware navigation trail
- **Deep Linking**: Direct URLs for all major features
- **Query Parameters**: 
  - `?date=yyyy-mm-dd` for date selection
  - `?duplicate=true` for workout duplication

---

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Configure Supabase project
5. Run database migrations
6. Start development server: `npm run dev`

### Database Setup
1. Create Supabase project
2. Run SQL migrations for tables
3. Set up Row Level Security (RLS) policies
4. Configure storage buckets for images
5. Set up authentication (if required)

### Default Data
The application includes default categories and exercises in `src/lib/defaultData.ts`:
- **Categories**: Chest, Back, Shoulders, Arms, Legs, Core, Cardio
- **Sample Exercises**: Basic exercises for each category
- **Initialization**: Automatic seeding on first run

---

## Key Implementation Details

### Offline-First Architecture
- **Primary**: Supabase for cloud storage
- **Fallback**: IndexedDB for offline functionality
- **Sync Strategy**: Background sync when online
- **Conflict Resolution**: Last-write-wins with user notification

### Performance Optimizations
- **Image Lazy Loading**: Intersection Observer API
- **Virtual Scrolling**: For large exercise lists
- **Query Caching**: React Query with appropriate stale times
- **Bundle Splitting**: Route-based code splitting

### Error Handling
- **Network Errors**: Graceful fallback to local storage
- **Validation**: Client-side and server-side validation
- **User Feedback**: Toast notifications for all operations
- **Logging**: Comprehensive console logging for debugging

### Security Considerations
- **Input Sanitization**: All user inputs validated
- **XSS Prevention**: React's built-in protection
- **Data Validation**: TypeScript type checking
- **API Security**: Supabase RLS policies

---

## Future Enhancement Opportunities

### Features
- **Social Features**: Share workouts, compete with friends
- **Advanced Analytics**: ML-powered insights
- **Wearable Integration**: Sync with fitness trackers
- **Nutrition Tracking**: Meal planning and calorie tracking
- **Personal Trainer Mode**: Guided workout programs

### Technical Improvements
- **PWA**: Full progressive web app capabilities
- **Push Notifications**: Workout reminders
- **Video Support**: Exercise demonstration videos
- **Voice Commands**: Voice-controlled workout tracking
- **AI Integration**: Automated workout suggestions

---

This documentation provides a complete blueprint for recreating the FitTrack application. Each section contains the necessary technical details, implementation patterns, and architectural decisions needed to build an identical application.
