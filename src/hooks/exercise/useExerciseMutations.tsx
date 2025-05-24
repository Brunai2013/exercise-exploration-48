
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addExercise, updateExercise, deleteExercise, addMultipleExercises } from '@/lib/exercises';
import { Exercise } from '@/lib/types';
import { toast } from 'sonner';
import { uploadExerciseImage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export function useExerciseMutations() {
  const queryClient = useQueryClient();

  // Create Exercise Mutation
  const createExerciseMutation = useMutation({
    mutationFn: (exercise: Exercise) => addExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error(`Failed to add exercise: ${error.message}`);
    }
  });

  // Create Multiple Exercises Mutation
  const createMultipleExercisesMutation = useMutation({
    mutationFn: (exercises: Exercise[]) => addMultipleExercises(exercises),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error(`Failed to add exercises: ${error.message}`);
    }
  });

  // Update Exercise Mutation
  const updateExerciseMutation = useMutation({
    mutationFn: (exercise: Exercise) => updateExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error(`Failed to update exercise: ${error.message}`);
    }
  });

  // Delete Exercise Mutation
  const deleteExerciseMutation = useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error(`Failed to delete exercise: ${error.message}`);
    }
  });

  // Create Exercise handler
  const handleCreateExercise = async (exerciseData: Partial<Exercise>, uploadedImage: File | null) => {
    try {
      // Check for required fields
      if (!exerciseData.name || !exerciseData.category) {
        toast.error('Exercise name and category are required');
        return false;
      }
      
      // Generate a unique ID for the exercise
      const exerciseId = uuidv4();
      let imageUrl = exerciseData.imageUrl || '';
      
      console.log('🔄 EXERCISE CREATE - Creating exercise:', {
        exerciseId,
        name: exerciseData.name,
        hasUploadedImage: !!uploadedImage,
        existingImageUrl: imageUrl,
        timestamp: new Date().toISOString()
      });
      
      // If there's an uploaded image, process it
      if (uploadedImage) {
        try {
          console.log('📤 IMAGE UPLOAD CREATE - Uploading new image for exercise creation...');
          const result = await uploadExerciseImage(uploadedImage);
          // Store the full URL instead of just the path
          imageUrl = result.url;
          console.log('✅ IMAGE UPLOAD CREATE SUCCESS - Image uploaded successfully:', {
            path: result.path,
            url: result.url,
            storingUrl: imageUrl,
            timestamp: new Date().toISOString()
          });
        } catch (uploadError) {
          console.error('❌ IMAGE UPLOAD CREATE FAILED - Error uploading image:', uploadError);
          toast.error('Failed to upload image, but will continue with exercise creation');
        }
      }
      
      // Create the exercise object
      const exercise: Exercise = {
        id: exerciseId,
        name: exerciseData.name,
        description: exerciseData.description || '',
        category: exerciseData.category,
        imageUrl: imageUrl
      };
      
      console.log('💾 DATABASE CREATE - Saving exercise to database:', {
        exercise,
        timestamp: new Date().toISOString()
      });
      
      // Save to database
      await createExerciseMutation.mutateAsync(exercise);
      console.log('✅ EXERCISE CREATE SUCCESS - Exercise created successfully');
      return true;
    } catch (error) {
      console.error('💥 EXERCISE CREATE ERROR - Error adding exercise:', error);
      return false;
    }
  };

  // Create Multiple Exercises handler
  const handleCreateMultipleExercises = async (exercises: Exercise[]) => {
    try {
      // Save exercises to database
      if (exercises.length === 0) {
        return true;
      }
      
      await createMultipleExercisesMutation.mutateAsync(exercises);
      return true;
    } catch (error) {
      console.error('Error adding exercises:', error);
      return false;
    }
  };

  // Update Exercise handler
  const handleUpdateExercise = async (
    exerciseId: string,
    exerciseData: Partial<Exercise>,
    uploadedImage: File | null
  ) => {
    try {
      // Check for required fields
      if (!exerciseData.name || !exerciseData.category) {
        toast.error('Exercise name and category are required');
        return false;
      }
      
      let imageUrl = exerciseData.imageUrl || '';
      
      console.log('🔄 EXERCISE UPDATE - Updating exercise:', {
        exerciseId,
        exerciseName: exerciseData.name,
        hasUploadedImage: !!uploadedImage,
        existingImageUrl: imageUrl,
        uploadedImageName: uploadedImage?.name,
        uploadedImageSize: uploadedImage?.size,
        timestamp: new Date().toISOString()
      });
      
      // If there's an uploaded image, process it
      if (uploadedImage) {
        try {
          console.log('📤 IMAGE UPLOAD UPDATE - Starting image upload for exercise update...');
          const result = await uploadExerciseImage(uploadedImage);
          // Store the full URL instead of just the path
          imageUrl = result.url;
          console.log('✅ IMAGE UPLOAD UPDATE SUCCESS - Image uploaded successfully for update:', {
            exerciseId,
            exerciseName: exerciseData.name,
            uploadPath: result.path,
            uploadUrl: result.url,
            storingUrl: imageUrl,
            timestamp: new Date().toISOString()
          });
        } catch (uploadError) {
          console.error('❌ IMAGE UPLOAD UPDATE FAILED - Error uploading image for update:', {
            exerciseId,
            exerciseName: exerciseData.name,
            uploadError,
            timestamp: new Date().toISOString()
          });
          toast.error('Failed to upload image, but will continue with exercise update');
        }
      }
      
      // Create the exercise object
      const exercise: Exercise = {
        id: exerciseId,
        name: exerciseData.name,
        description: exerciseData.description || '',
        category: exerciseData.category,
        imageUrl: imageUrl
      };
      
      console.log('💾 DATABASE UPDATE - Updating exercise in database:', {
        exercise,
        timestamp: new Date().toISOString()
      });
      
      // Update in database
      await updateExerciseMutation.mutateAsync(exercise);
      console.log('✅ EXERCISE UPDATE SUCCESS - Exercise updated successfully:', {
        exerciseId,
        exerciseName: exerciseData.name,
        finalImageUrl: imageUrl,
        timestamp: new Date().toISOString()
      });
      
      // Force refresh the queries to ensure UI updates
      console.log('🔄 CACHE REFRESH - Invalidating queries...');
      await queryClient.invalidateQueries({ queryKey: ['exercises'] });
      console.log('✅ CACHE REFRESHED - Queries invalidated');
      
      return true;
    } catch (error) {
      console.error('💥 EXERCISE UPDATE ERROR - Error updating exercise:', {
        exerciseId,
        exerciseName: exerciseData.name,
        error,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  };

  // Delete Exercise handler
  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      await deleteExerciseMutation.mutateAsync(exerciseId);
      return true;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      return false;
    }
  };

  return {
    handleCreateExercise,
    handleCreateMultipleExercises,
    handleUpdateExercise,
    handleDeleteExercise,
    
    // Expose the raw mutations for advanced use cases
    createExerciseMutation,
    updateExerciseMutation,
    deleteExerciseMutation,
    createMultipleExercisesMutation
  };
}
