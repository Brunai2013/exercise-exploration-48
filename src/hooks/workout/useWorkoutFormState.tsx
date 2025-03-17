
import { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { useParams, useSearchParams } from 'react-router-dom';
import { Workout } from '@/lib/types';
import { getWorkoutById } from '@/lib/workouts';
import { toast } from '@/components/ui/use-toast';

export const useWorkoutFormState = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialDateParam = searchParams.get('date');
  const isDuplicate = searchParams.get('duplicate') === 'true';
  
  const [workout, setWorkout] = useState<Partial<Workout>>({
    name: '',
    description: '',
    date: initialDateParam || (isDuplicate ? '' : format(new Date(), 'yyyy-MM-dd')),
    exercises: [],
    completed: false
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDateParam 
      ? parse(initialDateParam, 'yyyy-MM-dd', new Date()) 
      : isDuplicate ? undefined : new Date()
  );
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchWorkout = async () => {
      if (id && id !== 'new') {
        try {
          setIsLoading(true);
          const existingWorkout = await getWorkoutById(id);
          if (existingWorkout) {
            setWorkout(existingWorkout);
            setSelectedDate(parse(existingWorkout.date, 'yyyy-MM-dd', new Date()));
          }
        } catch (error) {
          console.error('Error fetching workout:', error);
          toast({
            title: "Error",
            description: "Failed to load workout. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else if (isDuplicate) {
        // Check for duplicated workout in localStorage
        try {
          const duplicatedWorkoutStr = localStorage.getItem('duplicated_workout');
          if (duplicatedWorkoutStr) {
            const duplicatedWorkout = JSON.parse(duplicatedWorkoutStr);
            setWorkout(duplicatedWorkout);
            // Don't set the date - leave it blank to require user input
            setSelectedDate(undefined);
            // Clear the localStorage item to prevent reuse
            localStorage.removeItem('duplicated_workout');
          }
        } catch (error) {
          console.error('Error loading duplicated workout:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    fetchWorkout();
  }, [id, isDuplicate]);
  
  useEffect(() => {
    if (selectedDate) {
      setWorkout(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
    } else if (workout.date) {
      // Clear the date field if selectedDate is undefined
      setWorkout(prev => ({ ...prev, date: '' }));
    }
  }, [selectedDate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWorkout(prev => ({ ...prev, [name]: value }));
  };
  
  return {
    id,
    workout,
    setWorkout,
    selectedDate,
    setSelectedDate,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    handleInputChange
  };
};
