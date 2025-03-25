import React from 'react';
import { Exercise, Category } from '@/lib/types';
import AddExerciseDialog from './AddExerciseDialog';
import EditExerciseDialog from './EditExerciseDialog';
import DeleteExerciseDialog from './DeleteExerciseDialog';
import CuratedExercisesDialog from './CuratedExercisesDialog';
import BackupRestoreDialog from '../data-backup/dialogs/BackupRestoreDialog';

interface ExerciseDialogsProps {
  isAddExerciseOpen: boolean;
  isEditExerciseOpen: boolean;
  isDeleteExerciseOpen: boolean;
  isCuratedExercisesOpen: boolean;
  isBackupDialogOpen?: boolean;
  selectedExercise: Exercise | null;
  exercises: Exercise[];
  categories: Category[];
  onAddExerciseOpenChange: (open: boolean) => void;
  onEditExerciseOpenChange: (open: boolean) => void;
  onDeleteExerciseOpenChange: (open: boolean) => void;
  onCuratedExercisesOpenChange: (open: boolean) => void;
  onBackupDialogOpenChange?: (open: boolean) => void;
  onCreateExercise: (exerciseData: Partial<Exercise>, uploadedImage: File | null) => Promise<boolean>;
  onUpdateExercise: (exerciseData: Partial<Exercise>, uploadedImage: File | null) => Promise<boolean>;
  onDeleteExercise: () => Promise<boolean>;
  onCreateMultipleExercises: (exercises: Exercise[]) => Promise<boolean>;
  onRefreshData?: () => void;
}

const ExerciseDialogs: React.FC<ExerciseDialogsProps> = ({
  isAddExerciseOpen,
  isEditExerciseOpen,
  isDeleteExerciseOpen,
  isCuratedExercisesOpen,
  isBackupDialogOpen = false,
  selectedExercise,
  exercises,
  categories,
  onAddExerciseOpenChange,
  onEditExerciseOpenChange,
  onDeleteExerciseOpenChange,
  onCuratedExercisesOpenChange,
  onBackupDialogOpenChange = () => {},
  onCreateExercise,
  onUpdateExercise,
  onDeleteExercise,
  onCreateMultipleExercises,
  onRefreshData = () => {},
}) => {
  return (
    <>
      <AddExerciseDialog
        isOpen={isAddExerciseOpen}
        onOpenChange={onAddExerciseOpenChange}
        categories={categories}
        onSubmit={onCreateExercise}
      />

      <EditExerciseDialog
        isOpen={isEditExerciseOpen}
        onOpenChange={onEditExerciseOpenChange}
        exercise={selectedExercise}
        categories={categories}
        onSubmit={onUpdateExercise}
        onDelete={() => {
          onEditExerciseOpenChange(false);
          onDeleteExerciseOpenChange(true);
        }}
      />

      <DeleteExerciseDialog
        isOpen={isDeleteExerciseOpen}
        onOpenChange={onDeleteExerciseOpenChange}
        exercise={selectedExercise}
        onDelete={onDeleteExercise}
      />

      <CuratedExercisesDialog
        isOpen={isCuratedExercisesOpen}
        onOpenChange={onCuratedExercisesOpenChange}
        existingExercises={exercises}
        categories={categories}
        onAddExercises={onCreateMultipleExercises}
      />

      <BackupRestoreDialog
        isOpen={isBackupDialogOpen}
        onOpenChange={onBackupDialogOpenChange}
        onRefreshData={onRefreshData}
      />
    </>
  );
};

export default ExerciseDialogs;
