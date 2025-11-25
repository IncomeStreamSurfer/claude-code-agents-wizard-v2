'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBrands } from '@/hooks/use-brands';
import { useProducts } from '@/hooks/use-products';
import { useTalents } from '@/hooks/use-talents';
import { useGenerateImage } from '@/hooks/use-generate-image';
import { ImageTypeSelector } from './image-type-selector';
import { StylePresetSelector } from './style-preset-selector';
import { FormatSelector } from './format-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { OUTPUT_FORMAT_PRESETS, IMAGE_TYPES } from '@/lib/prompts/presets';
import type { ImageType } from '@/lib/prompts/templates';
import type { StylePreset } from '@/lib/ai/types';

export function ImageGeneratorForm() {
  const router = useRouter();

  // Form state
  const [brandId, setBrandId] = useState<string>('');
  const [imageType, setImageType] = useState<ImageType | null>(null);
  const [productId, setProductId] = useState<string>('');
  const [talentId, setTalentId] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [stylePreset, setStylePreset] = useState<StylePreset | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['instagram_square', 'instagram_story']);
  const [variations, setVariations] = useState<number>(1);

  // Data fetching
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: talents, isLoading: talentsLoading } = useTalents();
  const { mutate: generateImage, isPending } = useGenerateImage();

  // Filter products and talents by selected brand
  const filteredProducts = useMemo(() => {
    if (!products || !brandId) return [];
    return products.filter(p => p.brand_id === brandId);
  }, [products, brandId]);

  const filteredTalents = useMemo(() => {
    if (!talents || !brandId) return [];
    return talents.filter(t => t.brand_id === brandId);
  }, [talents, brandId]);

  // Calculate total images to generate
  const totalImages = selectedFormats.length * variations;

  // Estimate time (rough estimate: 30 seconds per image)
  const estimatedMinutes = Math.ceil((totalImages * 30) / 60);

  // Validation
  const canSubmit =
    brandId &&
    imageType &&
    stylePreset &&
    selectedFormats.length > 0 &&
    !isPending;

  // Check if selected image type requires product/talent
  const requiresProduct = imageType ? IMAGE_TYPES[imageType].requiresProduct : false;
  const requiresTalent = imageType ? IMAGE_TYPES[imageType].requiresTalent : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit || !imageType || !stylePreset) return;

    // Build output formats
    const outputFormats = selectedFormats.map(key => ({
      name: OUTPUT_FORMAT_PRESETS[key].name,
      width: OUTPUT_FORMAT_PRESETS[key].width,
      height: OUTPUT_FORMAT_PRESETS[key].height,
    }));

    // Build prompt (will be enhanced by backend with templates)
    const prompt = customPrompt || `Generate ${imageType} image`;

    generateImage(
      {
        brand_id: brandId,
        product_id: productId || undefined,
        talent_id: talentId || undefined,
        image_type: imageType,
        custom_prompt: customPrompt || undefined,
        style_preset: stylePreset,
        output_formats: outputFormats,
        variations,
      },
      {
        onSuccess: (data) => {
          // Redirect to job details page
          router.push(`/creative/generate/jobs/${data.job_id}`);
        },
        onError: (error) => {
          // Error handling - could add toast notification here
          console.error('Generation failed:', error);
          alert(error.message || 'Failed to generate image');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Generate Image</CardTitle>
          <CardDescription>
            Create AI-generated marketing images for your brand
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

          {/* Image Type Selector */}
          <div className="space-y-2">
            <Label>What type of image?</Label>
            <ImageTypeSelector value={imageType} onChange={setImageType} />
          </div>

          {/* Product Selector (conditional) */}
          {brandId && (
            <div className="space-y-2">
              <Label htmlFor="product">
                Product {requiresProduct && <span className="text-destructive">*</span>}
                {!requiresProduct && <span className="text-muted-foreground text-xs ml-1">(optional)</span>}
              </Label>
              {productsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  id="product"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required={requiresProduct}
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

          {/* Talent Selector (conditional) */}
          {brandId && (
            <div className="space-y-2">
              <Label htmlFor="talent">
                Talent {requiresTalent && <span className="text-destructive">*</span>}
                {!requiresTalent && <span className="text-muted-foreground text-xs ml-1">(optional)</span>}
              </Label>
              {talentsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  id="talent"
                  value={talentId}
                  onChange={(e) => setTalentId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required={requiresTalent}
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

          {/* Custom Scene Description */}
          <div className="space-y-2">
            <Label htmlFor="custom-prompt">Scene Description (optional)</Label>
            <Textarea
              id="custom-prompt"
              placeholder="Add custom details to your prompt... (e.g., 'sunset beach background', 'urban street setting')"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This will be combined with the selected image type and style preset
            </p>
          </div>

          {/* Style Preset */}
          <StylePresetSelector value={stylePreset} onChange={setStylePreset} />

          {/* Output Formats */}
          <FormatSelector value={selectedFormats} onChange={setSelectedFormats} />

          {/* Variations */}
          <div className="space-y-2">
            <Label htmlFor="variations">Variations: {variations}</Label>
            <input
              id="variations"
              type="range"
              min="1"
              max="5"
              step="1"
              value={variations}
              onChange={(e) => setVariations(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <p className="text-xs text-muted-foreground">
              Generate {variations} variation{variations > 1 ? 's' : ''} of each format
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {totalImages} image{totalImages > 1 ? 's' : ''} • ~{estimatedMinutes} min
            </div>
            <Button type="submit" disabled={!canSubmit} size="lg">
              {isPending ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
