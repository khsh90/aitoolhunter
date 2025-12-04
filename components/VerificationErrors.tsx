'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, X } from 'lucide-react';
import { VerificationResult } from '@/lib/services/types';

interface VerificationErrorsProps {
  errors: VerificationResult[];
  onDismiss: () => void;
}

export function VerificationErrors({ errors, onDismiss }: VerificationErrorsProps) {
  return (
    <div className="fixed top-4 right-4 max-w-md z-50">
      <Card className="border-l-4 border-l-red-500 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Verification Failed
            </CardTitle>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {errors.map((error, idx) => (
            <div key={idx} className="bg-red-50 border border-red-200 rounded p-2">
              <p className="font-medium text-xs text-red-800 capitalize">{error.field}</p>
              <p className="text-xs text-red-600 mt-1">{error.error}</p>
            </div>
          ))}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-3">
            <p className="text-xs text-yellow-800">
              💡 The form has been pre-filled with generated data.
              Please correct the errors above manually before saving.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
