'use client';

import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { JobStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const getStatusConfig = (status: JobStatus) => {
    switch (status) {
      case 'queued':
        return {
          label: 'Queued',
          className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300',
          icon: null,
        };
      case 'processing':
        return {
          label: 'Processing',
          className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
        };
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
          icon: null,
        };
      case 'failed':
        return {
          label: 'Failed',
          className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
          icon: null,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
          icon: null,
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: null,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={cn('gap-1', config.className, className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
