/**
 * IndexedDB service for persistent storage 
 */
import { Exercise, Category, Workout } from './types';
import { toast } from 'sonner';

// Database configuration
const DB_NAME = 'fitness-tracker-db';
const DB_VERSION = 1;
const STORES = {
  EXERCISES: 'exercises',
  CATEGORIES: 'categories',
  WORKOUTS: 'workouts'
};

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.EXERCISES)) {
        const exerciseStore = db.createObjectStore(STORES.EXERCISES, { keyPath: 'id' });
        exerciseStore.createIndex('category', 'category', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
        db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.WORKOUTS)) {
        const workoutStore = db.createObjectStore(STORES.WORKOUTS, { keyPath: 'id' });
        workoutStore.createIndex('date', 'date', { unique: false });
      }
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      toast.error('Failed to initialize database');
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// Generic function to get all items from a store
const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result as T[]);
      };
      
      request.onerror = () => {
        console.error(`Error getting items from ${storeName}:`, request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Failed to get items from ${storeName}:`, error);
    return [];
  }
};

// Generic function to add or update an item in a store
const saveItem = async <T extends { id: string }>(
  storeName: string, 
  item: T
): Promise<T> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      
      request.onsuccess = () => {
        resolve(item);
      };
      
      request.onerror = () => {
        console.error(`Error saving item to ${storeName}:`, request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Failed to save item to ${storeName}:`, error);
    throw error;
  }
};

// Generic function to delete an item from a store
const deleteItem = async (storeName: string, id: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        console.error(`Error deleting item from ${storeName}:`, request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Failed to delete item from ${storeName}:`, error);
    throw error;
  }
};

// Generic function to get an item by ID
const getItemById = async <T>(storeName: string, id: string): Promise<T | undefined> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result as T);
      };
      
      request.onerror = () => {
        console.error(`Error getting item from ${storeName}:`, request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Failed to get item from ${storeName}:`, error);
    return undefined;
  }
};

// Exercise-specific functions
export const getAllExercises = (): Promise<Exercise[]> => 
  getAllItems<Exercise>(STORES.EXERCISES);

export const getExerciseById = (id: string): Promise<Exercise | undefined> => 
  getItemById<Exercise>(STORES.EXERCISES, id);

export const saveExercise = (exercise: Exercise): Promise<Exercise> => 
  saveItem<Exercise>(STORES.EXERCISES, exercise);

export const deleteExercise = (id: string): Promise<void> => 
  deleteItem(STORES.EXERCISES, id);

// Clear all exercises from local database
export const clearAllExercises = async (): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.EXERCISES, 'readwrite');
      const store = transaction.objectStore(STORES.EXERCISES);
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log('✅ LOCAL DB - All exercises cleared from IndexedDB');
        resolve();
      };
      
      request.onerror = () => {
        console.error('❌ LOCAL DB - Error clearing exercises from IndexedDB:', request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('💥 LOCAL DB - Failed to clear exercises from IndexedDB:', error);
    throw error;
  }
};

// Category-specific functions
export const getAllCategories = (): Promise<Category[]> => 
  getAllItems<Category>(STORES.CATEGORIES);

export const getCategoryById = (id: string): Promise<Category | undefined> => 
  getItemById<Category>(STORES.CATEGORIES, id);

export const saveCategory = (category: Category): Promise<Category> => 
  saveItem<Category>(STORES.CATEGORIES, category);

export const deleteCategory = (id: string): Promise<void> => 
  deleteItem(STORES.CATEGORIES, id);

// Workout-specific functions
export const getAllWorkouts = (): Promise<Workout[]> => 
  getAllItems<Workout>(STORES.WORKOUTS);

export const getWorkoutById = (id: string): Promise<Workout | undefined> => 
  getItemById<Workout>(STORES.WORKOUTS, id);

export const saveWorkout = (workout: Workout): Promise<Workout> => 
  saveItem<Workout>(STORES.WORKOUTS, workout);

export const deleteWorkout = (id: string): Promise<void> => 
  deleteItem(STORES.WORKOUTS, id);

// Function to get workouts by date
export const getWorkoutsByDate = async (date: string): Promise<Workout[]> => {
  try {
    const allWorkouts = await getAllWorkouts();
    return allWorkouts.filter(workout => workout.date === date);
  } catch (error) {
    console.error('Failed to get workouts by date:', error);
    return [];
  }
};

// Initialize the database with seed data
export const initializeWithSeedData = async (
  seedExercises: Exercise[], 
  seedCategories: Category[],
  seedWorkouts: Workout[]
) => {
  try {
    // Check if database is empty
    const existingExercises = await getAllExercises();
    const existingCategories = await getAllCategories();
    const existingWorkouts = await getAllWorkouts();
    
    // Only seed if empty
    if (existingExercises.length === 0) {
      for (const exercise of seedExercises) {
        await saveExercise(exercise);
      }
    }
    
    if (existingCategories.length === 0) {
      for (const category of seedCategories) {
        await saveCategory(category);
      }
    }
    
    if (existingWorkouts.length === 0) {
      for (const workout of seedWorkouts) {
        await saveWorkout(workout);
      }
    }
    
    console.log('Database initialized with seed data');
  } catch (error) {
    console.error('Error initializing database with seed data:', error);
  }
};
