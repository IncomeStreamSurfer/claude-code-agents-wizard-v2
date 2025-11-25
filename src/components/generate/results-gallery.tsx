'use client';

import { useState } from 'react';
import { CheckCircle2, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ResultCard, type ResultImage } from './result-card';
import { VideoPreview, type ResultVideo } from './video-preview';
import { useApproveCreative } from '@/hooks/use-approve-creative';
import { toast } from 'sonner';

interface ResultsGalleryProps {
  type: 'image' | 'video';
  results: {
    images?: ResultImage[];
    video?: ResultVideo;
  };
  brandId: string;
  jobId: string;
  prompt: string;
}

export function ResultsGallery({
  type,
  results,
  brandId,
  jobId,
  prompt,
}: ResultsGalleryProps) {
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());
  const [approvedIndexes, setApprovedIndexes] = useState<Set<number>>(new Set());
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const { mutate: approveCreative, isPending } = useApproveCreative();

  const isImage = type === 'image';
  const images = results.images || [];
  const video = results.video;

  const handleToggleSelect = (index: number) => {
    const newSelected = new Set(selectedIndexes);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndexes(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIndexes.size === images.length) {
      setSelectedIndexes(new Set());
    } else {
      setSelectedIndexes(new Set(images.map((_, idx) => idx)));
    }
  };

  const handleApproveImage = (index: number) => {
    const image = images[index];
    if (!image) return;

    approveCreative(
      {
        brand_id: brandId,
        type: 'image',
        file_url: image.url,
        name: image.variation || `Generated Image ${index + 1}`,
        dimensions: {
          width: image.width,
          height: image.height,
        },
        source: 'generated',
        metadata: {
          job_id: jobId,
          prompt: prompt,
          variation: image.variation,
          model_used: 'nano_banana_pro',
        },
        is_approved: true,
      },
      {
        onSuccess: () => {
          setApprovedIndexes((prev) => new Set([...prev, index]));
        },
      }
    );
  };

  const handleApproveSelected = () => {
    if (selectedIndexes.size === 0) {
      toast.info('No images selected');
      return;
    }

    const promises = Array.from(selectedIndexes).map((index) => {
      const image = images[index];
      if (!image) return Promise.resolve();

      return new Promise((resolve) => {
        approveCreative(
          {
            brand_id: brandId,
            type: 'image',
            file_url: image.url,
            name: image.variation || `Generated Image ${index + 1}`,
            dimensions: {
              width: image.width,
              height: image.height,
            },
            source: 'generated',
            metadata: {
              job_id: jobId,
              prompt: prompt,
              variation: image.variation,
              model_used: 'nano_banana_pro',
            },
            is_approved: true,
          },
          {
            onSuccess: () => {
              setApprovedIndexes((prev) => new Set([...prev, index]));
              resolve(true);
            },
            onError: () => {
              resolve(false);
            },
          }
        );
      });
    });

    Promise.all(promises).then(() => {
      setSelectedIndexes(new Set());
    });
  };

  const handleApproveAll = () => {
    const promises = images.map((image, index) => {
      return new Promise((resolve) => {
        approveCreative(
          {
            brand_id: brandId,
            type: 'image',
            file_url: image.url,
            name: image.variation || `Generated Image ${index + 1}`,
            dimensions: {
              width: image.width,
              height: image.height,
            },
            source: 'generated',
            metadata: {
              job_id: jobId,
              prompt: prompt,
              variation: image.variation,
              model_used: 'nano_banana_pro',
            },
            is_approved: true,
          },
          {
            onSuccess: () => {
              setApprovedIndexes((prev) => new Set([...prev, index]));
              resolve(true);
            },
            onError: () => {
              resolve(false);
            },
          }
        );
      });
    });

    Promise.all(promises);
  };

  const handleApproveVideo = () => {
    if (!video) return;

    approveCreative({
      brand_id: brandId,
      type: 'video',
      file_url: video.url,
      thumbnail_url: video.thumbnail_url,
      name: 'Generated Video',
      dimensions: video.dimensions,
      duration_seconds: video.duration,
      source: 'generated',
      metadata: {
        job_id: jobId,
        prompt: prompt,
        model_used: 'veo_3_1',
      },
      is_approved: true,
    });
  };

  const handleReject = (index?: number) => {
    if (index !== undefined) {
      // Remove from selected if it was selected
      const newSelected = new Set(selectedIndexes);
      newSelected.delete(index);
      setSelectedIndexes(newSelected);
    }
    // For now, just deselect. In the future, we could track rejected items
    toast.info('Asset rejected');
  };

  const approvedCount = approvedIndexes.size;
  const totalCount = isImage ? images.length : 1;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                {isImage
                  ? `${images.length} ${images.length === 1 ? 'variation' : 'variations'} generated`
                  : 'Your generated video'}
              </CardDescription>
            </div>

            {/* Approval stats */}
            {approvedCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                {approvedCount} of {totalCount} approved
              </div>
            )}
          </div>

          {/* Bulk actions for images */}
          {isImage && images.length > 0 && (
            <div className="flex items-center gap-2 pt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
              >
                {selectedIndexes.size === images.length ? 'Deselect All' : 'Select All'}
              </Button>

              {selectedIndexes.size > 0 && (
                <>
                  <Button
                    size="sm"
                    onClick={handleApproveSelected}
                    disabled={isPending}
                    className="gap-2"
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Selected ({selectedIndexes.size})
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedIndexes(new Set())}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </>
              )}

              {approvedCount < images.length && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleApproveAll}
                  disabled={isPending}
                  className="ml-auto gap-2"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Approve All
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Images grid */}
          {isImage && images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <ResultCard
                  key={index}
                  image={image}
                  index={index}
                  isApproved={approvedIndexes.has(index)}
                  isSelected={selectedIndexes.has(index)}
                  onApprove={() => handleApproveImage(index)}
                  onReject={() => handleReject(index)}
                  onToggleSelect={() => handleToggleSelect(index)}
                  onPreview={() => setPreviewIndex(index)}
                  isPending={isPending}
                />
              ))}
            </div>
          )}

          {/* Video player */}
          {!isImage && video && (
            <div className="max-w-3xl mx-auto">
              <VideoPreview
                video={video}
                isApproved={approvedIndexes.has(0)}
                onApprove={handleApproveVideo}
                onReject={() => handleReject()}
                isPending={isPending}
              />
            </div>
          )}

          {/* Empty state */}
          {isImage && images.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No results available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image preview dialog */}
      {previewIndex !== null && images[previewIndex] && (
        <Dialog open={previewIndex !== null} onOpenChange={() => setPreviewIndex(null)}>
          <DialogContent className="max-w-4xl p-0">
            <img
              src={images[previewIndex].url}
              alt={`Generated image ${previewIndex + 1}`}
              className="w-full h-auto"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
