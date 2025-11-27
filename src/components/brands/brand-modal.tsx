'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, X, Plus } from 'lucide-react';
import { useCreateBrand, useUpdateBrand } from '@/hooks/use-brands';
import type { Brand } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { uploadBrandLogo } from '@/lib/supabase/storage';
import { createClient } from '@/lib/supabase/client';

// Form validation schema
const brandFormSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(100, 'Brand name is too long'),
  industry: z.string().optional(),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  target_audience: z.string().optional(),
  colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')).optional(),
  fonts: z.array(z.string()).optional(),
});

type BrandFormData = z.infer<typeof brandFormSchema>;

interface BrandModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
}

export function BrandModal({ open, onOpenChange, brand }: BrandModalProps) {
  const isEditing = !!brand;
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(brand?.logo_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [colorInput, setColorInput] = useState('');
  const [colors, setColors] = useState<string[]>(
    brand?.colors ? (Array.isArray(brand.colors) ? brand.colors as string[] : []) : []
  );
  const [fontInput, setFontInput] = useState('');
  const [fonts, setFonts] = useState<string[]>(
    brand?.fonts ? (Array.isArray(brand.fonts) ? brand.fonts as string[] : []) : []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: brand?.name || '',
      industry: brand?.industry || '',
      website_url: brand?.website_url || '',
      target_audience:
        typeof brand?.target_audience === 'string'
          ? brand.target_audience
          : brand?.target_audience
            ? JSON.stringify(brand.target_audience)
            : '',
      colors: colors,
      fonts: fonts,
    },
  });

  // Reset form when brand changes or modal opens
  useEffect(() => {
    if (open) {
      const brandColors = brand?.colors ? (Array.isArray(brand.colors) ? brand.colors as string[] : []) : [];
      const brandFonts = brand?.fonts ? (Array.isArray(brand.fonts) ? brand.fonts as string[] : []) : [];

      setColors(brandColors);
      setFonts(brandFonts);
      setLogoPreview(brand?.logo_url || null);
      setLogoFile(null);
      setUploadError(null);

      reset({
        name: brand?.name || '',
        industry: brand?.industry || '',
        website_url: brand?.website_url || '',
        target_audience:
          typeof brand?.target_audience === 'string'
            ? brand.target_audience
            : brand?.target_audience
              ? JSON.stringify(brand.target_audience)
              : '',
        colors: brandColors,
        fonts: brandFonts,
      });
    }
  }, [open, brand, reset]);

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    setLogoFile(file);
    setUploadError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  // Add color
  const handleAddColor = () => {
    const color = colorInput.trim();
    if (!color) return;

    // Validate hex color
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return;
    }

    if (!colors.includes(color)) {
      const newColors = [...colors, color];
      setColors(newColors);
      setValue('colors', newColors);
    }
    setColorInput('');
  };

  // Remove color
  const handleRemoveColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
    setValue('colors', newColors);
  };

  // Add font
  const handleAddFont = () => {
    const font = fontInput.trim();
    if (!font) return;

    if (!fonts.includes(font)) {
      const newFonts = [...fonts, font];
      setFonts(newFonts);
      setValue('fonts', newFonts);
    }
    setFontInput('');
  };

  // Remove font
  const handleRemoveFont = (index: number) => {
    const newFonts = fonts.filter((_, i) => i !== index);
    setFonts(newFonts);
    setValue('fonts', newFonts);
  };

  // Form submission
  const onSubmit = async (data: BrandFormData) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      let logoUrl = brand?.logo_url || null;

      // Upload logo if a new file was selected
      if (logoFile) {
        // Get current user's org_id
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: userData } = await supabase
          .from('users')
          .select('org_id')
          .eq('id', user.id)
          .single();

        if (!userData?.org_id) throw new Error('User not associated with an organization');

        // Generate brand ID (use existing or create temporary one)
        const brandId = brand?.id || crypto.randomUUID();

        // Upload logo
        const { url } = await uploadBrandLogo(userData.org_id, brandId, logoFile);
        logoUrl = url;
      }

      // Prepare brand data
      const brandData = {
        name: data.name.trim(),
        industry: data.industry?.trim() || null,
        website_url: data.website_url?.trim() || null,
        logo_url: logoUrl,
        colors: colors.length > 0 ? colors : null,
        fonts: fonts.length > 0 ? fonts : null,
        target_audience: data.target_audience?.trim() || null,
      };

      // Create or update brand
      if (isEditing && brand) {
        await updateBrand.mutateAsync({ id: brand.id, data: brandData });
      } else {
        await createBrand.mutateAsync(brandData);
      }

      // Close modal and reset form
      onOpenChange(false);
      reset();
      setLogoFile(null);
      setLogoPreview(null);
      setColors([]);
      setFonts([]);
    } catch (error) {
      console.error('Error saving brand:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to save brand');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Brand' : 'Create New Brand'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your brand details and guidelines.'
              : 'Add a new brand to your organization.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Brand Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter brand name"
              {...register('name')}
              disabled={isSubmitting || isUploading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Brand Logo</Label>
            <div className="flex items-start gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-24 w-24 object-contain rounded-lg border bg-muted"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                    disabled={isSubmitting || isUploading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={isSubmitting || isUploading}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, or SVG. Max 5MB.
                </p>
              </div>
            </div>
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              placeholder="e.g., Technology, Fashion, Food & Beverage"
              {...register('industry')}
              disabled={isSubmitting || isUploading}
            />
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              placeholder="https://example.com"
              {...register('website_url')}
              disabled={isSubmitting || isUploading}
            />
            {errors.website_url && (
              <p className="text-sm text-destructive">{errors.website_url.message}</p>
            )}
          </div>

          {/* Brand Colors */}
          <div className="space-y-2">
            <Label>Brand Colors</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="#000000"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                disabled={isSubmitting || isUploading}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddColor}
                disabled={isSubmitting || isUploading || !colorInput.trim()}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 rounded-md border bg-muted"
                  >
                    <div
                      className="h-4 w-4 rounded border"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm">{color}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(index)}
                      disabled={isSubmitting || isUploading}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Enter hex color codes (e.g., #FF5733)
            </p>
          </div>

          {/* Brand Fonts */}
          <div className="space-y-2">
            <Label>Brand Fonts</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Font name"
                value={fontInput}
                onChange={(e) => setFontInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFont())}
                disabled={isSubmitting || isUploading}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddFont}
                disabled={isSubmitting || isUploading || !fontInput.trim()}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {fonts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {fonts.map((font, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 rounded-md border bg-muted"
                  >
                    <span className="text-sm">{font}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFont(index)}
                      disabled={isSubmitting || isUploading}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Add font names used in your brand (e.g., Helvetica, Roboto)
            </p>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="target_audience">Target Audience</Label>
            <Textarea
              id="target_audience"
              placeholder="Describe your target audience..."
              {...register('target_audience')}
              disabled={isSubmitting || isUploading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : isEditing ? (
                'Update Brand'
              ) : (
                'Create Brand'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
