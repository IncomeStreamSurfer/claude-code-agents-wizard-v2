'use client';

import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { GenerationQueue } from '@/components/generate/generation-queue';
import Link from 'next/link';

export default function GenerationJobsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/creative">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Creative Studio
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Generation Queue</h1>
            <p className="text-muted-foreground mt-1">
              Track your AI generation jobs in real-time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/creative/generate/image">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Generate Image
            </Button>
          </Link>
          <Link href="/creative/generate/video">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Generate Video
            </Button>
          </Link>
        </div>
      </div>

      {/* Generation Queue Component */}
      <GenerationQueue />
    </div>
  );
}
