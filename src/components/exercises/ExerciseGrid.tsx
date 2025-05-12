
import React, { useState, useEffect } from 'react';
import { Exercise, Category } from '@/lib/types';
import ExerciseCard from './ExerciseCard';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ImageOff, Dumbbell, Sparkles, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useCategoryColors } from '@/hooks/useCategoryColors';

interface ExerciseGridProps {
  exercises: Exercise[];
  categories?: Category[];
  isLoading?: boolean;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onExerciseSelect?: (exercise: Exercise) => void;
}

const ExerciseGrid: React.FC<ExerciseGridProps> = ({ 
  exercises, 
  categories = [],
  isLoading = false,
  onEdit,
  onDelete,
  onExerciseSelect 
}) => {
  const [selectedExercise, setSelectedExercise] = React.useState<Exercise | null>(null);
  const [imageError, setImageError] = useState(false);
  
  const { getCategory } = useCategoryColors();
  
  const selectedCategory = selectedExercise?.category 
    ? getCategory(selectedExercise.category) 
    : null;

  const handleExerciseClick = (exercise: Exercise) => {
    if (onExerciseSelect) {
      onExerciseSelect(exercise);
    } else {
      setSelectedExercise(exercise);
      setImageError(false);
    }
  };

  const handleDialogClose = () => {
    setSelectedExercise(null);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
        {Array.from({ length: 8 }).map((_, index) => (
          <div 
            key={index} 
            className="rounded-lg h-[280px] relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #f5f7ff 0%, #e7eaff 100%)'
            }}
          >
            <div className="h-3/5 bg-gradient-to-r from-indigo-50/50 to-purple-50/50"></div>
            <div className="h-2/5 p-4 space-y-3">
              <div className="h-4 bg-indigo-100/60 rounded-full w-3/4"></div>
              <div className="h-3 bg-indigo-100/40 rounded-full w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-2xl p-10 text-center border border-indigo-100/50 shadow-inner">
        <div className="flex flex-col items-center justify-center gap-4 my-4">
          <div className="p-4 rounded-full bg-white shadow-sm border border-indigo-100">
            <Dumbbell className="h-10 w-10 text-indigo-300" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">No exercises found</p>
          <p className="text-muted-foreground/70">Try adjusting your filters or add a new exercise</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
        {exercises.map((exercise) => (
          <ExerciseCard 
            key={exercise.id} 
            exercise={exercise} 
            onClick={() => handleExerciseClick(exercise)}
            onEdit={onEdit ? () => onEdit(exercise) : undefined}
            onDelete={onDelete ? () => onDelete(exercise) : undefined}
          />
        ))}
      </div>

      <Dialog open={!!selectedExercise} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-white to-indigo-50/20 backdrop-blur-xl border border-white/80 shadow-xl">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-2">
                  <span className="text-gradient flex items-center gap-2">
                    {selectedExercise.name}
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                  </span>
                  {selectedCategory && (
                    <span className={cn(
                      'text-xs px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm',
                      selectedCategory.color
                    )}>
                      {selectedCategory.name}
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground/80">
                  Exercise details and instructions
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/70 backdrop-blur-sm border border-indigo-100/50 overflow-hidden rounded-xl shadow-sm">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
                    {!imageError && selectedExercise.imageUrl ? (
                      <img 
                        src={selectedExercise.imageUrl} 
                        alt={selectedExercise.name}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50">
                        <Dumbbell className="h-16 w-16 text-indigo-300 opacity-50" />
                      </div>
                    )}
                  </div>
                </Card>
                <CardContent className="p-0">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-indigo-400" />
                    Description
                  </h4>
                  <p className="text-muted-foreground mb-4 bg-white/50 p-3 rounded-lg border border-indigo-50/30">
                    {selectedExercise.description || "No description available."}
                  </p>
                  
                  <h4 className="font-medium mb-2 flex items-center gap-2 mt-6">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    Instructions
                  </h4>
                  {selectedExercise.description ? (
                    <ol className="list-decimal pl-6 text-muted-foreground space-y-2 bg-white/50 p-3 rounded-lg border border-indigo-50/30">
                      {selectedExercise.description.split('. ').filter(Boolean).map((step, index) => (
                        <li key={index} className="pl-1 pb-2">{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-muted-foreground bg-white/50 p-3 rounded-lg border border-indigo-50/30">
                      No instructions available.
                    </p>
                  )}
                </CardContent>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExerciseGrid;
