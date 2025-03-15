
// Re-export everything from our workouts module
export { 
  getRecentWorkouts,
  getTodayWorkouts,
  getUpcomingWorkouts,
  getWorkoutsByDate,
  getWorkoutById,
  addWorkout,
  updateWorkout,
  deleteWorkout,
  generateWorkoutId
} from './workouts';

// Re-export from exercises.ts
export {
  exercises,
  getAllExercises,
  getExerciseById,
  addExercise,
  updateExercise,
  deleteExercise
} from './exercises';

// Re-export from categories.ts
export {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory
} from './categories';
