
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Save, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  error?: string;
  onSubmit?: () => void; // Added optional onSubmit prop
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  isSubmitting,
  submitLabel,
  error,
  onSubmit
}) => {
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4 rounded-xl border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end gap-4 pt-5">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting}
          className="px-5 rounded-full border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button 
          type={onSubmit ? "button" : "submit"}
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FormActions;
