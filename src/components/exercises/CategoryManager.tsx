
import React, { useState, useEffect } from 'react';
import { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import CategoryForm from './categories/CategoryForm';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface CategoryManagerProps {
  categories: Category[];
  exercises?: any[];
  onBack: () => void;
  onCategoryAdd?: (category: Omit<Category, 'id'>) => void;
  onCategoryUpdate?: (category: Category) => void;
  onCategoryDelete?: (categoryId: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  exercises = [],
  onBack,
  onCategoryAdd,
  onCategoryUpdate,
  onCategoryDelete,
}) => {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    color: 'bg-[#8B5CF6] text-white',
  });
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  
  // Fetch fresh categories directly from database to ensure we have the latest colors
  useEffect(() => {
    const fetchFreshCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (!error && data) {
          // Ensure all categories have valid colors
          const updatedCategories = data.map(cat => ({
            ...cat,
            color: cat.color || 'bg-[#8B5CF6] text-white'
          }));
          setLocalCategories(updatedCategories);
        }
      } catch (err) {
        console.error('Error fetching fresh categories:', err);
      }
    };
    
    fetchFreshCategories();
  }, []);
  
  // Update local state when props change
  useEffect(() => {
    if (categories.length > 0) {
      setLocalCategories(categories);
    }
  }, [categories]);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setNewCategory({
        name: category.name,
        color: category.color,
      });
    } else {
      setEditingCategory(null);
      setNewCategory({
        name: '',
        color: 'bg-[#8B5CF6] text-white',
      });
    }
    setFormDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!newCategory.name) {
      toast.error('Category name is required');
      return;
    }

    if (editingCategory) {
      // Update existing category
      const updatedCategory = {
        ...editingCategory,
        name: newCategory.name || '',
        color: newCategory.color || 'bg-[#8B5CF6] text-white',
      };
      
      await onCategoryUpdate?.(updatedCategory);
      
      // Update local state immediately
      setLocalCategories(prev => 
        prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
      );
    } else {
      // Add new category
      const category = {
        name: newCategory.name || '',
        color: newCategory.color || 'bg-[#8B5CF6] text-white',
      };
      
      await onCategoryAdd?.(category);
      
      // We'll let the useEffect refresh categories from the server
    }
    
    setFormDialogOpen(false);
    setEditingCategory(null);
    setNewCategory({ name: '', color: 'bg-[#8B5CF6] text-white' });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this category? This will affect all exercises using this category.');
    if (confirmed) {
      await onCategoryDelete?.(categoryId);
      // Update local state immediately
      setLocalCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-2 p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h3 className="text-lg font-medium">Manage Categories</h3>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="space-y-2">
        {localCategories.map((category) => {
          // Extract color classes directly
          const colorClasses = category.color || 'bg-[#8B5CF6] text-white';
          
          return (
            <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={cn('px-3 py-1.5 rounded-md text-sm shadow-sm', colorClasses)}>
                  {category.name}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenDialog(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {localCategories.length === 0 && (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">No categories found. Create your first category.</p>
          </div>
        )}
      </div>

      {/* Form Dialog for adding/editing categories */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Update the category details below.' 
                : 'Create a new category for organizing exercises.'}
            </DialogDescription>
          </DialogHeader>

          <CategoryForm
            category={newCategory}
            onCategoryChange={setNewCategory}
            onSave={handleSaveCategory}
            onCancel={() => setFormDialogOpen(false)}
            isEditing={!!editingCategory}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager;
