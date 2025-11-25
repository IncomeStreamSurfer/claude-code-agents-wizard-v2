'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, X, GripVertical, Package } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-products';
import { useBrands } from '@/hooks/use-brands';
import type { Product } from '@/types/database';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { uploadFile } from '@/lib/supabase/storage';
import { createClient } from '@/lib/supabase/client';

// Form validation schema
const productFormSchema = z.object({
  brand_id: z.string().min(1, 'Brand is required'),
  name: z.string().min(1, 'Product name is required').max(200, 'Product name is too long'),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0, 'Price must be positive').optional().nullable(),
  currency: z.string().optional().nullable(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

interface ImagePreview {
  id: string;
  url: string;
  file?: File;
  isExisting: boolean;
}

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ProductModal({ open, onOpenChange, product }: ProductModalProps) {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: brands } = useBrands();

  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      brand_id: product?.brand_id || '',
      name: product?.name || '',
      description: product?.description || '',
      sku: product?.sku || '',
      price: product?.price || null,
      currency: product?.currency || 'USD',
    },
  });

  const selectedBrandId = watch('brand_id');
  const selectedBrand = brands?.find((b) => b.id === selectedBrandId);

  // Reset form when modal opens or product changes
  useEffect(() => {
    if (open) {
      reset({
        brand_id: product?.brand_id || '',
        name: product?.name || '',
        description: product?.description || '',
        sku: product?.sku || '',
        price: product?.price || null,
        currency: product?.currency || 'USD',
      });

      // Load existing images
      if (product?.images && product.images.length > 0) {
        setImages(
          product.images.map((url, index) => ({
            id: `existing-${index}`,
            url,
            isExisting: true,
          }))
        );
      } else {
        setImages([]);
      }

      setUploadError(null);
    }
  }, [open, product, reset]);

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

  // Form submission
  const onSubmit = async (data: ProductFormData) => {
    try {
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

      // Generate product ID
      const productId = product?.id || crypto.randomUUID();

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
          const path = `${userData.org_id}/${productId}/${fileName}`;

          const { url } = await uploadFile({
            bucket: 'product-images',
            path,
            file: image.file,
          });

          uploadedUrls.push(url);
        }
      }

      // Prepare product data
      const productData = {
        brand_id: data.brand_id,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        sku: data.sku?.trim() || null,
        price: data.price || null,
        currency: data.currency || null,
        images: uploadedUrls.length > 0 ? uploadedUrls : null,
        is_active: true,
      };

      // Create or update product
      if (isEditing && product) {
        await updateProduct.mutateAsync({ id: product.id, data: productData });
      } else {
        await createProduct.mutateAsync(productData);
      }

      // Close modal and reset
      onOpenChange(false);
      reset();
      setImages([]);
    } catch (error) {
      console.error('Error saving product:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update product details and images.'
              : 'Add a new product to your catalog.'}
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

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter product name"
              {...register('name')}
              disabled={isSubmitting || isUploading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Product description..."
              {...register('description')}
              disabled={isSubmitting || isUploading}
              rows={3}
            />
          </div>

          {/* SKU and Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="SKU-123"
                {...register('sku')}
                disabled={isSubmitting || isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('price', { valueAsNumber: true })}
                disabled={isSubmitting || isUploading}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    type="button"
                    disabled={isSubmitting || isUploading}
                  >
                    {watch('currency') || 'USD'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setValue('currency', 'USD')}>
                    USD
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setValue('currency', 'EUR')}>
                    EUR
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setValue('currency', 'GBP')}>
                    GBP
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Product Images</Label>

            {/* Image Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
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
                      alt={`Product ${index + 1}`}
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
                  id="product-images"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isSubmitting || isUploading}
                />
                <label
                  htmlFor="product-images"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="rounded-full bg-primary/10 p-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG up to 10MB ({images.length}/{MAX_IMAGES} images)
                    </p>
                  </div>
                </label>
              </div>
            )}

            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              First image will be used as the primary product image. Drag to reorder.
            </p>
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
                'Update Product'
              ) : (
                'Create Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
