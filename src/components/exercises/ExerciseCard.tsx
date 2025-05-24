
import React, { useState, useEffect } from 'react';
import { Exercise } from '@/lib/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu';
import { Edit, Trash, Dumbbell } from 'lucide-react';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { ensureFullImageUrl } from '@/lib/storage';

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
  // Use centralized hook for category data
  const { getCategory } = useCategoryColors();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Get category from the centralized hook
  const category = exercise.category ? getCategory(exercise.category) : null;
  
  // Check if the image URL is valid on component mount and correct it
  useEffect(() => {
    console.log('🖼️ CARD IMAGE PROCESSING - Processing image for exercise card:', {
      exerciseName: exercise.name,
      exerciseId: exercise.id,
      originalImageUrl: exercise.imageUrl,
      imageUrlType: exercise.imageUrl ? (exercise.imageUrl.startsWith('http') ? 'Full URL' : 'Storage Path') : 'None',
      timestamp: new Date().toISOString()
    });
    
    if (exercise.imageUrl) {
      // Always use the ensureFullImageUrl utility to handle all URL formats and domain corrections
      const correctedUrl = ensureFullImageUrl(exercise.imageUrl);
      
      if (correctedUrl) {
        console.log('🔍 CARD URL TEST - Testing corrected URL for card:', {
          exerciseName: exercise.name,
          exerciseId: exercise.id,
          originalUrl: exercise.imageUrl,
          correctedUrl: correctedUrl,
          urlWasCorrected: correctedUrl !== exercise.imageUrl,
          timestamp: new Date().toISOString()
        });
        
        // Always test if the corrected URL actually works
        const img = new Image();
        img.onload = () => {
          console.log('✅ CARD IMAGE SUCCESS - Image loaded successfully in card:', {
            exerciseName: exercise.name,
            url: correctedUrl,
            timestamp: new Date().toISOString()
          });
          setImageUrl(correctedUrl);
          setImageError(false);
        };
        img.onerror = () => {
          console.error('❌ CARD IMAGE FAILED - Image failed to load in card:', {
            exerciseName: exercise.name,
            url: correctedUrl,
            timestamp: new Date().toISOString()
          });
          setImageError(true);
          setImageUrl(null);
        };
        img.src = correctedUrl;
      } else {
        console.warn('⚠️ URL PROCESSING FAILED - Failed to process URL for card:', {
          exerciseName: exercise.name,
          originalUrl: exercise.imageUrl,
          timestamp: new Date().toISOString()
        });
        setImageError(true);
      }
    } else {
      console.log('📷 NO IMAGE - No image URL provided for card:', {
        exerciseName: exercise.name,
        exerciseId: exercise.id,
        timestamp: new Date().toISOString()
      });
      setImageError(true);
      setImageUrl(null);
    }
  }, [exercise.imageUrl, exercise.name, exercise.id]);

  const handleImageError = () => {
    console.warn('🚫 IMAGE ERROR - Image error occurred in card:', {
      exerciseName: exercise.name,
      attemptedUrl: imageUrl,
      timestamp: new Date().toISOString()
    });
    setImageError(true);
    setImageUrl(null);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
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
            {!imageError && imageUrl ? (
              <img 
                src={imageUrl} 
                alt={exercise.name}
                className="object-cover w-full h-full transition-all duration-300 group-hover:scale-105"
                onError={handleImageError}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Dumbbell className="h-12 w-12 text-gray-300" />
              </div>
            )}
            
            <div className={cn(
              "absolute inset-0 bg-black/0 transition-all duration-300",
              isHovered && "bg-black/20"
            )} />

            {category && (
              <div className="absolute bottom-3 left-3 z-10">
                <span className={cn(
                  'text-xs font-medium px-3 py-1.5 rounded-md shadow-sm',
                  category.color
                )}>
                  {category.name}
                </span>
              </div>
            )}
            
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

export default ExerciseCard;
