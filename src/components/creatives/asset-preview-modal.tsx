'use client';

import { useState } from 'react';
import { Download, CheckCircle, XCircle, Calendar, User, Sparkles, Trash2, Loader2 } from 'lucide-react';
import type { CreativeWithBrand } from '@/hooks/use-creatives';
import { useUpdateCreativeApproval, useDeleteCreative } from '@/hooks/use-creatives';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface AssetPreviewModalProps {
  creative: CreativeWithBrand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetPreviewModal({ creative, open, onOpenChange }: AssetPreviewModalProps) {
  const updateApproval = useUpdateCreativeApproval();
  const deleteCreative = useDeleteCreative();
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!creative) return null;

  const isVideo = creative.type === 'video';
  const metadata = creative.metadata as any;

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);
    try {
      await updateApproval.mutateAsync({
        id: creative.id,
        isApproved: true,
      });
    } catch (err) {
      console.error('Failed to approve creative:', err);
      setError('Failed to approve creative');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsApproving(true);
    setError(null);
    try {
      await updateApproval.mutateAsync({
        id: creative.id,
        isApproved: false,
      });
    } catch (err) {
      console.error('Failed to reject creative:', err);
      setError('Failed to reject creative');
    } finally {
      setIsApproving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await deleteCreative.mutateAsync(creative.id);
      onOpenChange(false); // Close the modal after deletion
    } catch (err) {
      console.error('Failed to delete creative:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete creative');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    window.open(creative.file_url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {creative.name || 'Untitled'}
              </DialogTitle>
              {creative.brands && (
                <p className="text-muted-foreground mt-1">{creative.brands.name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mt-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Preview */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {isVideo ? (
                <video
                  src={creative.file_url}
                  controls
                  className="w-full h-full object-contain"
                  poster={creative.thumbnail_url || undefined}
                />
              ) : (
                <img
                  src={creative.file_url}
                  alt={creative.name || 'Creative asset'}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{creative.type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="font-medium capitalize">{creative.source}</p>
              </div>
              {creative.dimensions && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Dimensions</p>
                  <p className="font-medium">
                    {(creative.dimensions as any).width} x {(creative.dimensions as any).height}
                  </p>
                </div>
              )}
              {creative.file_size_bytes && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">File Size</p>
                  <p className="font-medium">
                    {(creative.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold">Status</h3>
              <div className="flex items-center gap-2">
                {creative.is_approved === true && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Approved
                  </Badge>
                )}
                {creative.is_approved === false && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Rejected
                  </Badge>
                )}
                {creative.is_approved === null && (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>

              {/* Approval actions */}
              {creative.is_approved !== true && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  {creative.is_approved !== false && (
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={isApproving}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Generation details for AI-generated assets */}
            {creative.source === 'generated' && metadata?.prompt && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generation Details
                </h3>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Model Used</p>
                    <p className="font-medium">
                      {metadata.model_used === 'nano_banana_pro' && 'Nano Banana Pro'}
                      {metadata.model_used === 'veo_3_1' && 'VEO 3.1'}
                      {!metadata.model_used && 'Unknown'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Prompt</p>
                    <p className="text-sm bg-muted p-3 rounded-md mt-1">
                      {metadata.prompt}
                    </p>
                  </div>

                  {metadata.negative_prompt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Negative Prompt</p>
                      <p className="text-sm bg-muted p-3 rounded-md mt-1">
                        {metadata.negative_prompt}
                      </p>
                    </div>
                  )}

                  {metadata.generation_params && (
                    <div>
                      <p className="text-sm text-muted-foreground">Parameters</p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {Object.entries(metadata.generation_params).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-muted-foreground">{key}:</span>{' '}
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Metadata */}
            <div className="space-y-3">
              <h3 className="font-semibold">Information</h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Created {format(new Date(creative.created_at!), 'PPP')}
                </div>

                {creative.approved_by && creative.approved_at && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    {creative.is_approved ? 'Approved' : 'Rejected'} on{' '}
                    {format(new Date(creative.approved_at), 'PPP')}
                  </div>
                )}

                {creative.tags && creative.tags.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Tags</p>
                    <div className="flex gap-1 flex-wrap">
                      {creative.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
