import React, { useState, useEffect } from 'react';
import { Exercise } from '@/lib/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu';
import { Edit, Trash, Dumbbell } from 'lucide-react';
import { useCategoryColors } from '@/hooks/useCategoryColors';

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
  
  // Check if the image URL is valid on component mount
  useEffect(() => {
    console.log('🖼️ ExerciseCard processing image for:', exercise.name, {
      exerciseId: exercise.id,
      originalImageUrl: exercise.imageUrl,
      imageUrlType: exercise.imageUrl ? (exercise.imageUrl.startsWith('http') ? 'Full URL' : 'Storage Path') : 'None'
    });
    
    if (exercise.imageUrl) {
      // If it's from Supabase Storage but doesn't have the full URL
      if (exercise.imageUrl.startsWith('exercises/') && !exercise.imageUrl.startsWith('http')) {
        console.log('🔄 Converting storage path to URL for:', exercise.name, exercise.imageUrl);
        // We need to convert it to a full URL
        import('@/integrations/supabase/client').then(({ supabase }) => {
          const { data } = supabase.storage
            .from('exercise-images')
            .getPublicUrl(exercise.imageUrl);
          
          const fullUrl = data?.publicUrl;
          console.log('🔗 Converted to full URL:', {
            exercise: exercise.name,
            originalPath: exercise.imageUrl,
            fullUrl
          });
          
          if (fullUrl) {
            setImageUrl(fullUrl);
            setImageError(false);
            
            // Test if the URL actually works
            const img = new Image();
            img.onload = () => {
              console.log('✅ Image loaded successfully:', fullUrl);
            };
            img.onerror = () => {
              console.error('❌ Image failed to load after conversion:', fullUrl);
              setImageError(true);
              setImageUrl(null);
            };
            img.src = fullUrl;
          } else {
            console.warn('⚠️ Failed to get public URL for:', exercise.imageUrl);
            setImageError(true);
          }
        });
      } else {
        // Regular URL or already full Supabase URL
        console.log('🔍 Testing regular/full URL:', exercise.imageUrl);
        const img = new Image();
        img.onload = () => {
          console.log('✅ Image loaded successfully:', exercise.imageUrl);
          setImageUrl(exercise.imageUrl);
          setImageError(false);
        };
        img.onerror = () => {
          console.error('❌ Image failed to load:', exercise.imageUrl);
          setImageError(true);
          setImageUrl(null);
        };
        img.src = exercise.imageUrl;
      }
    } else {
      console.log('📷 No image URL provided for:', exercise.name);
      setImageError(true);
      setImageUrl(null);
    }
  }, [exercise.imageUrl, exercise.name, exercise.id]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  const handleImageError = () => {
    console.warn('🚫 Image error occurred for:', exercise.name, imageUrl);
    setImageError(true);
    setImageUrl(null);
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
