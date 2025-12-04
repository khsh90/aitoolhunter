'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, Edit, RefreshCw } from 'lucide-react';

interface UnknownToolModalProps {
  toolName: string;
  reason: string;
  onManualEntry: () => void;
  onRetry: () => void;
  onCancel: () => void;
}

export function UnknownToolModal({
  toolName,
  reason,
  onManualEntry,
  onRetry,
  onCancel
}: UnknownToolModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Unable to Find Tool Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold text-gray-800">Tool: {toolName}</p>
            <p className="text-sm text-gray-600 mt-1">Reason: {reason}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <p className="font-medium text-yellow-800 mb-1">Possible causes:</p>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>Tool name may be misspelled</li>
              <li>Tool is very new or niche</li>
              <li>Tool doesn&apos;t have an official website</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={onManualEntry} className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Enter Information Manually
            </Button>
            <Button onClick={onRetry} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Different Name
            </Button>
            <Button onClick={onCancel} variant="ghost" className="w-full">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
