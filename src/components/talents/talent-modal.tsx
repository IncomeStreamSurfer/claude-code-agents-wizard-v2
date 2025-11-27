'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, X, GripVertical, User } from 'lucide-react';
import { useCreateTalent, useUpdateTalent } from '@/hooks/use-talents';
import { useBrands } from '@/hooks/use-brands';
import type { Talent, PlatformType } from '@/types/database';
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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { uploadFile } from '@/lib/supabase/storage';
import { createClient } from '@/lib/supabase/client';

// Form validation schema
const talentFormSchema = z.object({
  brand_id: z.string().min(1, 'Brand is required'),
  name: z.string().min(1, 'Talent name is required').max(200, 'Talent name is too long'),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
  expires_at: z.string().optional().nullable(),
  approved_platforms: z.array(z.string()).optional(),
  usage_rights: z.object({
    can_use_likeness: z.boolean().optional(),
    territories: z.array(z.string()).optional(),
    exclusivity: z.string().optional(),
  }).optional(),
});

type TalentFormData = z.infer<typeof talentFormSchema>;

interface TalentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  talent?: Talent | null;
}

interface ImagePreview {
  id: string;
  url: string;
  file?: File;
  isExisting: boolean;
}

const MIN_IMAGES = 1;
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const PLATFORMS: PlatformType[] = ['meta', 'google', 'tiktok', 'linkedin', 'pinterest', 'programmatic'];
const PLATFORM_LABELS: Record<PlatformType, string> = {
  meta: 'Meta (Facebook/Instagram)',
  google: 'Google Ads',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  programmatic: 'Programmatic',
};

export function TalentModal({ open, onOpenChange, talent }: TalentModalProps) {
  const isEditing = !!talent;
  const createTalent = useCreateTalent();
  const updateTalent = useUpdateTalent();
  const { data: brands } = useBrands();

  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<TalentFormData>({
    resolver: zodResolver(talentFormSchema),
    defaultValues: {
      brand_id: talent?.brand_id || '',
      name: talent?.name || '',
      notes: talent?.notes || '',
      is_active: talent?.is_active ?? true,
      expires_at: talent?.expires_at || null,
      approved_platforms: talent?.approved_platforms || [],
      usage_rights: talent?.usage_rights as any || {
        can_use_likeness: true,
        territories: [],
        exclusivity: '',
      },
    },
  });

  const selectedBrandId = watch('brand_id');
  const selectedBrand = brands?.find((b) => b.id === selectedBrandId);
  const isActive = watch('is_active');

  // Reset form when modal opens or talent changes
  useEffect(() => {
    if (open) {
      reset({
        brand_id: talent?.brand_id || '',
        name: talent?.name || '',
        notes: talent?.notes || '',
        is_active: talent?.is_active ?? true,
        expires_at: talent?.expires_at || null,
        approved_platforms: talent?.approved_platforms || [],
        usage_rights: talent?.usage_rights as any || {
          can_use_likeness: true,
          territories: [],
          exclusivity: '',
        },
      });

      // Load existing images
      if (talent?.reference_images && talent.reference_images.length > 0) {
        setImages(
          talent.reference_images.map((url, index) => ({
            id: `existing-${index}`,
            url,
            isExisting: true,
          }))
        );
      } else {
        setImages([]);
      }

      // Set selected platforms
      setSelectedPlatforms(talent?.approved_platforms || []);

      setUploadError(null);
    }
  }, [open, talent, reset]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total image count
    if (images.length + files.length > MAX_IMAGES) {
      setUploadError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`File ${file.name} is too large. Max 10MB per image.`);
        return;
      }
      validFiles.push(file);
    }

    // Create previews
    const newPreviews: ImagePreview[] = [];
    validFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview: ImagePreview = {
          id: `new-${Date.now()}-${index}`,
          url: reader.result as string,
          file,
          isExisting: false,
        };
        newPreviews.push(preview);

        if (newPreviews.length === validFiles.length) {
          setImages((prev) => [...prev, ...newPreviews]);
          setUploadError(null);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  // Handle drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Remove image
  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Handle drop zone
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    // Create a fake input event
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;

    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    input.files = dataTransfer.files;

    handleFileSelect({ target: input } as any);
  };

  // Handle platform toggle
  const handlePlatformToggle = (platform: PlatformType) => {
    setSelectedPlatforms((prev) => {
      const newPlatforms = prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform];
      setValue('approved_platforms', newPlatforms);
      return newPlatforms;
    });
  };

  // Form submission
  const onSubmit = async (data: TalentFormData) => {
    try {
      // Validate at least one image
      if (images.length < MIN_IMAGES) {
        setUploadError(`At least ${MIN_IMAGES} reference photo is required`);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      // Get org_id
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!userData?.org_id) throw new Error('User not associated with an organization');

      // Generate talent ID
      const talentId = talent?.id || crypto.randomUUID();

      // Upload new images
      const uploadedUrls: string[] = [];
      for (const image of images) {
        if (image.isExisting) {
          // Keep existing image URL
          uploadedUrls.push(image.url);
        } else if (image.file) {
          // Upload new image
          const ext = image.file.name.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
          const path = `${userData.org_id}/${talentId}/${fileName}`;

          const { url } = await uploadFile({
            bucket: 'talent-photos',
            path,
            file: image.file,
          });

          uploadedUrls.push(url);
        }
      }

      // Prepare talent data
      const talentData = {
        brand_id: data.brand_id,
        name: data.name.trim(),
        notes: data.notes?.trim() || null,
        reference_images: uploadedUrls,
        is_active: data.is_active,
        expires_at: data.expires_at || null,
        approved_platforms: selectedPlatforms.length > 0 ? selectedPlatforms : null,
        usage_rights: data.usage_rights || null,
      };

      // Create or update talent
      if (isEditing && talent) {
        await updateTalent.mutateAsync({ id: talent.id, data: talentData });
      } else {
        await createTalent.mutateAsync(talentData);
      }

      // Close modal and reset
      onOpenChange(false);
      reset();
      setImages([]);
      setSelectedPlatforms([]);
    } catch (error) {
      console.error('Error saving talent:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to save talent');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Talent' : 'Add New Talent'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update talent details and reference photos.'
              : 'Add a new talent with clear face photos for AI training.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Brand Selector */}
          <div className="space-y-2">
            <Label htmlFor="brand_id">
              Brand <span className="text-destructive">*</span>
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  type="button"
                  disabled={isSubmitting || isUploading}
                >
                  {selectedBrand ? selectedBrand.name : 'Select a brand'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {brands?.map((brand) => (
                  <DropdownMenuItem
                    key={brand.id}
                    onClick={() => setValue('brand_id', brand.id)}
                  >
                    {brand.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {errors.brand_id && (
              <p className="text-sm text-destructive">{errors.brand_id.message}</p>
            )}
          </div>

          {/* Talent Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Talent Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter talent name"
              {...register('name')}
              disabled={isSubmitting || isUploading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Reference Images Upload */}
          <div className="space-y-2">
            <Label>
              Reference Photos <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Upload 1-5 clear face shots for AI training and consistency
            </p>

            {/* Image Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="relative group aspect-square rounded-lg overflow-hidden border bg-muted cursor-move"
                  >
                    <img
                      src={image.url}
                      alt={`Talent ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <GripVertical className="h-6 w-6 text-white" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isSubmitting || isUploading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Zone */}
            {images.length < MAX_IMAGES && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
              >
                <input
                  type="file"
                  id="talent-images"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isSubmitting || isUploading}
                />
                <label
                  htmlFor="talent-images"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="rounded-full bg-primary/10 p-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG up to 10MB ({images.length}/{MAX_IMAGES} photos)
                    </p>
                  </div>
                </label>
              </div>
            )}

            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any relevant notes about this talent..."
              {...register('notes')}
              disabled={isSubmitting || isUploading}
              rows={3}
            />
          </div>

          {/* Approved Platforms */}
          <div className="space-y-2">
            <Label>Approved Platforms</Label>
            <p className="text-xs text-muted-foreground">
              Select which platforms this talent is approved for
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLATFORMS.map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={`platform-${platform}`}
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={() => handlePlatformToggle(platform)}
                    disabled={isSubmitting || isUploading}
                  />
                  <Label
                    htmlFor={`platform-${platform}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {PLATFORM_LABELS[platform]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Active Status and Expiration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                  disabled={isSubmitting || isUploading}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Inactive talents won't be available for campaigns
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiration Date</Label>
              <Input
                id="expires_at"
                type="date"
                {...register('expires_at')}
                disabled={isSubmitting || isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Optional usage rights expiration
              </p>
            </div>
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
                'Update Talent'
              ) : (
                'Create Talent'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
