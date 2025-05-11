
import { Exercise, Category } from './types';
import { v4 as uuidv4 } from 'uuid';

// Default categories that will be loaded if no categories exist in the database
export const defaultCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Chest',
    color: '#ff4757',
  },
  {
    id: 'cat-2',
    name: 'Back',
    color: '#2ed573',
  },
  {
    id: 'cat-3',
    name: 'Legs',
    color: '#1e90ff',
  },
  {
    id: 'cat-4',
    name: 'Arms',
    color: '#ffa502',
  },
  {
    id: 'cat-5',
    name: 'Shoulders',
    color: '#a55eea',
  },
  {
    id: 'cat-6',
    name: 'Core',
    color: '#2f3542',
  },
  {
    id: 'cat-7',
    name: 'Cardio',
    color: '#ff6b81',
  },
];

// Default exercises that will be loaded if no exercises exist in the database
export const defaultExercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Bench Press',
    description: 'A compound exercise that targets the chest, shoulders, and triceps.',
    category: 'cat-1',
    imageUrl: 'https://dmmlcayednczwbojdhqs.supabase.co/storage/v1/object/public/exercise-images/bench_press.jpg',
  },
  {
    id: 'ex-2',
    name: 'Deadlift',
    description: 'A compound exercise that targets the back, glutes, and hamstrings.',
    category: 'cat-2',
    imageUrl: 'https://dmmlcayednczwbojdhqs.supabase.co/storage/v1/object/public/exercise-images/deadlift.jpg',
  },
  {
    id: 'ex-3',
    name: 'Squat',
    description: 'A compound exercise that targets the quadriceps, hamstrings, and glutes.',
    category: 'cat-3',
    imageUrl: 'https://dmmlcayednczwbojdhqs.supabase.co/storage/v1/object/public/exercise-images/squat.jpg',
  },
  {
    id: 'ex-4',
    name: 'Bicep Curl',
    description: 'An isolation exercise that targets the biceps.',
    category: 'cat-4',
    imageUrl: 'https://dmmlcayednczwbojdhqs.supabase.co/storage/v1/object/public/exercise-images/bicep_curl.jpg',
  },
  {
    id: 'ex-5',
    name: 'Shoulder Press',
    description: 'A compound exercise that targets the shoulders and triceps.',
    category: 'cat-5',
    imageUrl: 'https://dmmlcayednczwbojdhqs.supabase.co/storage/v1/object/public/exercise-images/shoulder_press.jpg',
  },
  {
    id: 'ex-6',
    name: 'Plank',
    description: 'A static exercise that targets the core.',
    category: 'cat-6',
    imageUrl: 'https://dmmlcayednczwbojdhqs.supabase.co/storage/v1/object/public/exercise-images/plank.jpg',
  },
  {
    id: 'ex-7',
    name: 'Running',
    description: 'A cardio exercise that targets the heart and lungs.',
    category: 'cat-7',
    imageUrl: 'https://dmmlcayednczwbojdhqs.supabase.co/storage/v1/object/public/exercise-images/running.jpg',
  },
];
