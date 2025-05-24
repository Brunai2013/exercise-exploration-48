
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ui/image-upload';
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Exercise } from '@/lib/types';
import { ensureFullImageUrl } from '@/lib/storage';

interface ImageSectionProps {
  form: UseFormReturn<Partial<Exercise>>;
  onImageChange: (file: File | null, preview: string | null) => void;
  imagePreview: string | null;
}

const ImageSection: React.FC<ImageSectionProps> = ({
  form,
  onImageChange,
  imagePreview
}) => {
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue('imageUrl', url);
    
    // If we set a URL manually, clear the uploaded image
    if (url) {
      onImageChange(null, null);
    }
  };

  // Process the imageUrl from the form to ensure it's always a full URL for preview
  React.useEffect(() => {
    const currentImageUrl = form.getValues('imageUrl');
    console.log('🖼️ IMAGE SECTION - Processing form image URL:', {
      currentImageUrl,
      imagePreview,
      timestamp: new Date().toISOString()
    });
    
    if (currentImageUrl && !imagePreview) {
      // Use ensureFullImageUrl to correct any domain issues
      const correctedUrl = ensureFullImageUrl(currentImageUrl);
      
      console.log('🔧 IMAGE SECTION - URL correction result:', {
        originalUrl: currentImageUrl,
        correctedUrl,
        urlChanged: correctedUrl !== currentImageUrl,
        timestamp: new Date().toISOString()
      });
      
      if (correctedUrl && correctedUrl !== currentImageUrl) {
        // Only set for preview, don't change the actual form value unless it's clearly wrong
        onImageChange(null, correctedUrl);
      } else if (correctedUrl) {
        // Test if the URL actually works before using it as preview
        const img = new Image();
        img.onload = () => {
          console.log('✅ IMAGE SECTION - Image URL verified:', correctedUrl);
          onImageChange(null, correctedUrl);
        };
        img.onerror = () => {
          console.error('❌ IMAGE SECTION - Image URL failed verification:', correctedUrl);
        };
        img.src = correctedUrl;
      }
    }
  }, [form, imagePreview, onImageChange]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <ImageUpload
          onImageChange={onImageChange}
          previewUrl={imagePreview}
          maxSizeMB={5}
          minWidth={400}
          minHeight={400}
          maxWidth={1500}
          maxHeight={1500}
          aspectRatio={1}
          helpText={imagePreview ? "Current image shown. Click to replace." : "Square images work best (1:1 ratio). Non-square images will be auto-cropped from the center."}
        />
        
        {imagePreview && (
          <p className="text-xs text-muted-foreground mt-2">
            Current image is displayed above. Click "Replace Image" to change it.
          </p>
        )}
      </div>
      
      <div className="pt-2 border-t border-gray-100">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Or use an image URL</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleImageUrlChange(e);
                  }}
                  placeholder="https://example.com/image.jpg"
                  disabled={!!imagePreview && !field.value}
                  className="mt-1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {(!imagePreview && !form.getValues('imageUrl')) && (
          <p className="text-xs text-muted-foreground mt-2">
            Either upload an image or provide a URL
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageSection;
