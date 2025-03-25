
import { Exercise, Category, Workout, WorkoutExercise, ExerciseSet } from '../types';

/**
 * Interface for comprehensive backup data
 */
export interface BackupData {
  exercises: Exercise[];
  categories: Category[];
  workouts: Workout[];
  timestamp: string;
  version: string;
  schemaVersion: string;
}

export interface BackupFile {
  name: string;
  path: string;
  created_at: string;
}

export interface BackupResult {
  path?: string;
  data?: BackupData;
  fileName?: string;
}
