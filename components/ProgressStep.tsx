'use client';

import { CheckCircle, Loader2, Circle } from 'lucide-react';

interface ProgressStepProps {
  label: string;
  active: boolean;
  complete: boolean;
}

export function ProgressStep({ label, active, complete }: ProgressStepProps) {
  return (
    <div className="flex items-center gap-3">
      {complete ? (
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
      ) : active ? (
        <Loader2 className="h-5 w-5 animate-spin text-blue-500 flex-shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
      )}
      <span className={`text-sm ${
        complete ? 'text-green-700 font-medium' :
        active ? 'text-blue-700 font-medium' :
        'text-gray-500'
      }`}>
        {label}
      </span>
    </div>
  );
}
