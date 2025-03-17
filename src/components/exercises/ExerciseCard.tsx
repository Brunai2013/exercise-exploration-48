
import React, { useState, useEffect } from 'react';
import { Exercise } from '@/lib/types';
import { getCategoryById, getCategoryByIdSync } from '@/lib/categories';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu';
import { Edit, Trash, ImageOff, Dumbbell } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  onClick,
  onEdit,
  onDelete 
}) => {
  const [category, setCategory] = useState(getCategoryByIdSync(exercise.category));
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const loadCategory = async () => {
      if (exercise.category) {
        const loadedCategory = await getCategoryById(exercise.category);
        if (loadedCategory) {
          setCategory(loadedCategory);
        }
      }
    };
    
    loadCategory();
  }, [exercise.category]);
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div 
          className="overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer relative rounded-xl h-[280px] flex flex-col bg-white"
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AspectRatio ratio={4/3} className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-stone-100">
            {!imageError && exercise.imageUrl ? (
              <img 
                src={exercise.imageUrl} 
                alt={exercise.name}
                className="object-cover w-full h-full transition-all duration-300 group-hover:scale-105"
                onError={handleImageError}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Dumbbell className="h-12 w-12 text-gray-300" />
              </div>
            )}
            
            {/* Overlay on hover */}
            <div className={cn(
              "absolute inset-0 bg-black/0 transition-all duration-300",
              isHovered && "bg-black/20"
            )} />

            {/* Category badge positioned at bottom of image */}
            {category && (
              <div className="absolute bottom-3 left-3 z-10">
                <span className={cn(
                  'text-xs font-medium px-3 py-1.5 rounded-md shadow-sm',
                  getCategoryBadgeStyle(category.name.toLowerCase())
                )}>
                  {category.name}
                </span>
              </div>
            )}
            
            {/* Action buttons that appear on hover */}
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity duration-300" 
                 style={{ opacity: isHovered ? 1 : 0 }}>
              {onEdit && (
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8 bg-white rounded-full shadow-md" 
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 text-gray-700" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-8 w-8 bg-white hover:bg-red-500 rounded-full shadow-md" 
                  onClick={handleDelete}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </AspectRatio>
          
          {/* Title area at bottom with clean design */}
          <div className="p-4 flex flex-col items-center justify-center text-center">
            <h3 className="font-medium text-gray-900 text-base">{exercise.name}</h3>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {onEdit && (
          <ContextMenuItem onClick={handleEdit} className="cursor-pointer">
            <Edit className="h-4 w-4 mr-2" />
            Edit Exercise
          </ContextMenuItem>
        )}
        {onDelete && (
          <ContextMenuItem onClick={handleDelete} className="cursor-pointer text-red-500">
            <Trash className="h-4 w-4 mr-2" />
            Delete Exercise
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

// Function to get specialized badge styles based on muscle group/category
const getCategoryBadgeStyle = (category: string): string => {
  const categoryMap: Record<string, string> = {
    // Modern themed palette - all colors have matching text contrast
    'back': 'bg-indigo-100 text-indigo-800',
    'arms': 'bg-purple-100 text-purple-800', 
    'chest': 'bg-blue-100 text-blue-800',
    'shoulders': 'bg-teal-100 text-teal-800',
    'legs': 'bg-emerald-100 text-emerald-800',
    'core': 'bg-amber-100 text-amber-800',
    'glutes': 'bg-rose-100 text-rose-800',
    'cardio': 'bg-sky-100 text-sky-800',
    'strength': 'bg-slate-100 text-slate-800',
    'flexibility': 'bg-cyan-100 text-cyan-800',
    'balance': 'bg-orange-100 text-orange-800',
  };

  // Check if the category name contains any of the keys as a substring
  for (const [key, value] of Object.entries(categoryMap)) {
    if (category.includes(key)) {
      return value;
    }
  }

  // Default badge style
  return 'bg-gray-100 text-gray-800';
};

export default ExerciseCard;
