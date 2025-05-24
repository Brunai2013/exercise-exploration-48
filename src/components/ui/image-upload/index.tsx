
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ImageUploadProps } from "./types";
import { processImage } from "./image-processor";
import { UploadPlaceholder } from "./upload-placeholder";
import { ImagePreview } from "./image-preview";

export function ImageUpload({
  onImageChange,
  previewUrl,
  className,
  maxSizeMB = 2,
  minWidth = 200,
  minHeight = 200,
  maxWidth = 2000,
  maxHeight = 2000,
  aspectRatio,
  helpText,
  alt = "Image preview",
  ...props
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (previewUrl) {
      setPreview(previewUrl);
    }
  }, [previewUrl]);

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    console.log('Processing new file:', file.name);
    processImage(
      file,
      { maxSizeMB, minWidth, minHeight, maxWidth, maxHeight, aspectRatio },
      (optimizedFile, optimizedDataUrl) => {
        console.log('Image processed successfully');
        setPreview(optimizedDataUrl);
        onImageChange(optimizedFile, optimizedDataUrl);
      }
    );
  };

  const removeImage = () => {
    console.log('Removing image');
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onImageChange(null, null);
  };

  const replaceImage = () => {
    console.log('Replace image triggered, opening file dialog');
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!preview) {
      inputRef.current?.click();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border",
          preview ? "h-auto aspect-auto" : "h-40"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!preview ? handleClick : undefined}
      >
        {preview ? (
          <ImagePreview 
            previewUrl={preview}
            alt={alt}
            onRemove={removeImage}
            onReplace={replaceImage}
          />
        ) : (
          <>
            <UploadPlaceholder
              minWidth={minWidth}
              minHeight={minHeight}
              maxWidth={maxWidth}
              maxHeight={maxHeight}
              maxSizeMB={maxSizeMB}
              aspectRatio={aspectRatio}
              onClick={handleClick}
            />
          </>
        )}
      </div>
      
      {/* Hidden file input that's always present */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFileChange(e.target.files)}
        {...props}
      />
      
      {helpText && !preview && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}

// Re-export for backwards compatibility
export * from "./types";
