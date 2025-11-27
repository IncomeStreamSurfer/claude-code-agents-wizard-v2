'use client';

import { useState, useRef } from 'react';
import { CheckCircle2, XCircle, Download, Maximize2, Play, Pause } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export interface ResultVideo {
  url: string;
  thumbnail_url?: string;
  duration: number;
  dimensions: {
    width: number;
    height: number;
  };
}

interface VideoPreviewProps {
  video: ResultVideo;
  isApproved: boolean;
  onApprove: () => void;
  onReject: () => void;
  isPending?: boolean;
}

export function VideoPreview({
  video,
  isApproved,
  onApprove,
  onReject,
  isPending = false,
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(video.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-video.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* Approved badge */}
        {isApproved && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="gap-1 bg-green-600 hover:bg-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Approved
            </Badge>
          </div>
        )}

        {/* Video player */}
        <div className="relative aspect-video bg-black overflow-hidden group">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            poster={video.thumbnail_url}
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={video.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Play/Pause overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
              onClick={togglePlay}
            >
              <Play className="h-20 w-20 text-white drop-shadow-lg" />
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-white">
                  {formatDuration(video.duration)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsFullscreen(true)}
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Info and actions */}
        <div className="p-4 space-y-3">
          {/* Dimensions and duration */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {video.dimensions.width} × {video.dimensions.height}
            </span>
            <span>{formatDuration(video.duration)}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isApproved ? (
              <>
                <Button
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={onApprove}
                  disabled={isPending}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve Video
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReject}
                  disabled={isPending}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download Video'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Fullscreen dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl p-0 bg-black">
          <video
            ref={fullscreenVideoRef}
            className="w-full h-full"
            controls
            autoPlay
            poster={video.thumbnail_url}
          >
            <source src={video.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </DialogContent>
      </Dialog>
    </>
  );
}
