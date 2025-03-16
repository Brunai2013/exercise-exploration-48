
import React, { useState } from 'react';
import { Exercise, Category } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExerciseSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  availableExercises: Exercise[];
  categories: Category[];
  isLoading: boolean;
  onExerciseAdd: (exercise: Exercise) => void;
  categoryMap: Record<string, string>;
}

const ExerciseSearch: React.FC<ExerciseSearchProps> = ({
  searchTerm,
  onSearchChange,
  availableExercises,
  categories,
  isLoading,
  onExerciseAdd,
  categoryMap
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const getCategoryName = (categoryId: string | undefined): string => {
    if (!categoryId) return "Uncategorized";
    return categoryMap[categoryId] || "Uncategorized";
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const filteredExercises = availableExercises.filter(exercise => {
    // First filter by search term
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Then filter by category if one is selected
    const matchesCategory = selectedCategory ? exercise.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="sticky top-20">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Add Exercises</h3>
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input 
              placeholder="Search exercises..." 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10 bg-white"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Category filters */}
          <div className="mb-3 overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(null)}
                className="rounded-full"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading exercises...</p>
            ) : filteredExercises.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No exercises found</p>
            ) : (
              <div className="space-y-1">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => onExerciseAdd(exercise)}
                  >
                    <div 
                      className="h-10 w-10 rounded bg-cover bg-center mr-3" 
                      style={{ backgroundImage: `url(${exercise.imageUrl})` }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{getCategoryName(exercise.category)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseSearch;
