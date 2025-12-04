'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Activity, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import { QuotaStatus } from '@/lib/services/types';

interface QuotaDisplayProps {
  quotas: QuotaStatus[];
}

export function QuotaDisplay({ quotas }: QuotaDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  const criticalServices = quotas.filter(q => q.percentageUsedDaily > 80);

  return (
    <Card className="glass border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            API Quota Status
            {criticalServices.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {criticalServices.length} Near Limit
              </span>
            )}
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3 pt-0">
          {quotas.map(q => (
            <div key={q.service} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs capitalize">{q.service}</span>
                  {q.percentageUsedDaily > 80 && (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <div className="text-xs">
                  <span className={q.percentageUsedDaily > 80 ? 'text-red-600 font-bold' : 'text-gray-600'}>
                    {q.usedDaily}
                  </span>
                  <span className="text-gray-400 mx-0.5">/</span>
                  <span className="text-gray-500">{q.limitDaily}</span>
                  <span className="text-gray-400 ml-1">today</span>
                </div>
              </div>

              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                    q.percentageUsedDaily > 90 ? 'bg-red-500' :
                    q.percentageUsedDaily > 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(q.percentageUsedDaily, 100)}%` }}
                />
              </div>

              {q.percentageUsedDaily > 80 && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Approaching daily limit. Consider manual entry for some tools.
                </p>
              )}
            </div>
          ))}

          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Quotas reset daily at midnight Pacific Time
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
