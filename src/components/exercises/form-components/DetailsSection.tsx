
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Exercise, Category } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface DetailsSectionProps {
  form: UseFormReturn<Partial<Exercise>>;
  categories: Category[];
}

const DetailsSection: React.FC<DetailsSectionProps> = ({
  form,
  categories
}) => {
  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Exercise Name *</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                placeholder="e.g., Bench Press"
                className="mt-1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Category *</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Description</FormLabel>
            <FormControl>
              <Textarea 
                {...field}
                placeholder="Describe how to perform this exercise..."
                rows={5}
                className="mt-1 resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DetailsSection;
