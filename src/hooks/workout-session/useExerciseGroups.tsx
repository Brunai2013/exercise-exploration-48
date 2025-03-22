
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

export interface ExerciseGroup {
  id: string;
  type: 'circuit';
  exerciseIds: string[];
}

export const useExerciseGroups = () => {
  const [exerciseGroups, setExerciseGroups] = useState<ExerciseGroup[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [groupingMode, setGroupingMode] = useState<boolean>(false);
  
  const isExerciseInGroup = (exerciseId: string): boolean => {
    return exerciseGroups.some(group => 
      group.exerciseIds.includes(exerciseId)
    );
  };
  
  const getExerciseGroup = (exerciseId: string): ExerciseGroup | undefined => {
    return exerciseGroups.find(group => 
      group.exerciseIds.includes(exerciseId)
    );
  };
  
  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };
  
  const clearSelectedExercises = () => {
    setSelectedExercises([]);
  };
  
  const createGroup = (exerciseIds: string[]) => {
    if (exerciseIds.length < 2) {
      toast({
        title: "Cannot Create Circuit",
        description: "Need at least 2 exercises for a circuit",
        variant: "destructive",
      });
      return;
    }
    
    setExerciseGroups(prev => {
      const affectedGroups = prev.filter(group => 
        group.exerciseIds.some(id => exerciseIds.includes(id))
      );
      
      if (affectedGroups.length > 0) {
        const updatedGroups = prev.map(group => ({
          ...group,
          exerciseIds: group.exerciseIds.filter(id => !exerciseIds.includes(id))
        })).filter(group => group.exerciseIds.length > 1);
        
        return [
          ...updatedGroups,
          { id: uuidv4(), type: 'circuit', exerciseIds }
        ];
      } else {
        return [
          ...prev,
          { id: uuidv4(), type: 'circuit', exerciseIds }
        ];
      }
    });
    
    clearSelectedExercises();
    setGroupingMode(false);
  };
  
  const removeFromGroup = (exerciseId: string) => {
    setExerciseGroups(prev => {
      const updatedGroups = prev.map(group => {
        if (group.exerciseIds.includes(exerciseId)) {
          const updatedIds = group.exerciseIds.filter(id => id !== exerciseId);
          return {
            ...group,
            exerciseIds: updatedIds
          };
        }
        return group;
      }).filter(group => group.exerciseIds.length > 1);
      
      return updatedGroups;
    });
  };
  
  const startGroupingMode = () => {
    setGroupingMode(true);
    clearSelectedExercises();
    
    toast({
      title: "Creating Circuit",
      description: "Select at least 2 exercises to group",
    });
  };

  const cancelGroupingMode = () => {
    setGroupingMode(false);
    clearSelectedExercises();
  };
  
  const handleCreateCustomGroup = () => {
    if (selectedExercises.length < 2) {
      toast({
        title: "Not Enough Exercises",
        description: "Select at least 2 exercises for a circuit",
        variant: "destructive",
      });
      return;
    }
    
    createGroup(selectedExercises);
    
    toast({
      title: "Circuit Created",
      description: `${selectedExercises.length} exercises grouped successfully`,
    });
  };
  
  return {
    exerciseGroups,
    selectedExercises,
    groupingMode,
    isExerciseInGroup,
    getExerciseGroup,
    toggleExerciseSelection,
    clearSelectedExercises,
    createGroup,
    removeFromGroup,
    startGroupingMode,
    cancelGroupingMode,
    handleCreateCustomGroup
  };
};
