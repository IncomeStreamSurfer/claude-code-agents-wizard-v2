'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBrands } from '@/hooks/use-brands';
import { useProducts } from '@/hooks/use-products';
import { useTalents } from '@/hooks/use-talents';
import { useGenerateVideo } from '@/hooks/use-generate-video';
import { VideoTypeSelector, type VideoType } from './video-type-selector';
import { DurationSelector, type VideoDuration } from './duration-selector';
import { AspectRatioSelector, type AspectRatio } from './aspect-ratio-selector';
import { StylePresetSelector } from './style-preset-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import type { StylePreset } from '@/lib/ai/types';
import type { MusicMood } from '@/hooks/use-generate-video';

export function VideoGeneratorForm() {
  const router = useRouter();

  // Form state
  const [brandId, setBrandId] = useState<string>('');
  const [videoType, setVideoType] = useState<VideoType | null>(null);
  const [productId, setProductId] = useState<string>('');
  const [talentId, setTalentId] = useState<string>('');
  const [script, setScript] = useState<string>('');
  const [sceneDescription, setSceneDescription] = useState<string>('');
  const [stylePreset, setStylePreset] = useState<StylePreset | null>(null);
  const [duration, setDuration] = useState<VideoDuration | null>(30);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio | null>('9:16');
  const [musicMood, setMusicMood] = useState<MusicMood | ''>('');
  const [includeCaptions, setIncludeCaptions] = useState<boolean>(true);

  // Data fetching
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: talents, isLoading: talentsLoading } = useTalents();
  const { mutate: generateVideo, isPending } = useGenerateVideo();

  // Filter products and talents by selected brand
  const filteredProducts = useMemo(() => {
    if (!products || !brandId) return [];
    return products.filter(p => p.brand_id === brandId);
  }, [products, brandId]);

  const filteredTalents = useMemo(() => {
    if (!talents || !brandId) return [];
    return talents.filter(t => t.brand_id === brandId);
  }, [talents, brandId]);

  // Calculate estimated time based on duration and video type
  const estimatedMinutes = useMemo(() => {
    if (!duration) return 2;

    // Base time varies by duration
    const baseTime = {
      15: 2,  // 2 minutes for 15s video
      30: 3,  // 3 minutes for 30s video
      60: 5,  // 5 minutes for 60s video
    }[duration];

    // Add time for complex types
    const complexityMultiplier = videoType === 'testimonial' || videoType === 'product_demo' ? 1.2 : 1;

    return Math.ceil(baseTime * complexityMultiplier);
  }, [duration, videoType]);

  // Validation
  const canSubmit =
    brandId &&
    videoType &&
    duration &&
    aspectRatio &&
    !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit || !videoType || !duration || !aspectRatio) return;

    generateVideo(
      {
        brand_id: brandId,
        video_type: videoType,
        product_id: productId || undefined,
        talent_id: talentId || undefined,
        script: script || undefined,
        scene_description: sceneDescription || undefined,
        style_preset: stylePreset || undefined,
        duration,
        aspect_ratio: aspectRatio,
        music_mood: musicMood || undefined,
        include_captions: includeCaptions,
      },
      {
        onSuccess: (data) => {
          // Redirect to job details page
          router.push(`/creative/generate/jobs/${data.job_id}`);
        },
        onError: (error) => {
          // Error handling - could add toast notification here
          console.error('Generation failed:', error);
          alert(error.message || 'Failed to generate video');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Generate Video</CardTitle>
          <CardDescription>
            Create AI-generated marketing videos for your brand
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Brand Selector */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            {brandsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <select
                id="brand"
                value={brandId}
                onChange={(e) => {
                  setBrandId(e.target.value);
                  setProductId(''); // Reset product when brand changes
                  setTalentId(''); // Reset talent when brand changes
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select brand...</option>
                {brands?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Video Type Selector */}
          <div className="space-y-2">
            <Label>Video Type</Label>
            <VideoTypeSelector value={videoType} onChange={setVideoType} />
          </div>

          {/* Product Selector (optional) */}
          {brandId && (
            <div className="space-y-2">
              <Label htmlFor="product">
                Product <span className="text-muted-foreground text-xs ml-1">(optional)</span>
              </Label>
              {productsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  id="product"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select product...</option>
                  {filteredProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              )}
              {filteredProducts.length === 0 && brandId && !productsLoading && (
                <p className="text-sm text-muted-foreground">
                  No products found for this brand. Add products first.
                </p>
              )}
            </div>
          )}

          {/* Talent Selector (optional) */}
          {brandId && (
            <div className="space-y-2">
              <Label htmlFor="talent">
                Talent <span className="text-muted-foreground text-xs ml-1">(optional)</span>
              </Label>
              {talentsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  id="talent"
                  value={talentId}
                  onChange={(e) => setTalentId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select talent...</option>
                  {filteredTalents.map((talent) => (
                    <option key={talent.id} value={talent.id}>
                      {talent.name}
                    </option>
                  ))}
                </select>
              )}
              {filteredTalents.length === 0 && brandId && !talentsLoading && (
                <p className="text-sm text-muted-foreground">
                  No talents found for this brand. Add talents first.
                </p>
              )}
            </div>
          )}

          {/* Script (optional) */}
          <div className="space-y-2">
            <Label htmlFor="script">Script (optional)</Label>
            <Textarea
              id="script"
              placeholder="Enter voiceover or dialogue script..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Provide voiceover text or dialogue for your video
            </p>
          </div>

          {/* Scene Description */}
          <div className="space-y-2">
            <Label htmlFor="scene-description">Scene Description</Label>
            <Textarea
              id="scene-description"
              placeholder="Describe the scenes, actions, and visual elements... (e.g., 'Person unboxing product with excited reaction, close-up shots of features')"
              value={sceneDescription}
              onChange={(e) => setSceneDescription(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Describe what should happen in the video
            </p>
          </div>

          {/* Style Preset */}
          <StylePresetSelector value={stylePreset} onChange={setStylePreset} />

          {/* Duration Selector */}
          <DurationSelector value={duration} onChange={setDuration} />

          {/* Aspect Ratio Selector */}
          <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />

          {/* Music Mood */}
          <div className="space-y-2">
            <Label htmlFor="music-mood">Music Mood (optional)</Label>
            <select
              id="music-mood"
              value={musicMood}
              onChange={(e) => setMusicMood(e.target.value as MusicMood | '')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">No background music</option>
              <option value="upbeat">Upbeat</option>
              <option value="calm">Calm</option>
              <option value="energetic">Energetic</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          {/* Include Captions */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-captions"
              checked={includeCaptions}
              onCheckedChange={(checked) => setIncludeCaptions(checked === true)}
            />
            <Label
              htmlFor="include-captions"
              className="text-sm font-normal cursor-pointer"
            >
              Include Captions
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              ~{estimatedMinutes} {estimatedMinutes === 1 ? 'minute' : 'minutes'}
            </div>
            <Button type="submit" disabled={!canSubmit} size="lg">
              {isPending ? 'Generating...' : 'Generate Video'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
