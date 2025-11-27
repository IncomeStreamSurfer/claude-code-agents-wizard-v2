import { createClient } from './client';

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File;
  contentType?: string;
}

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const { bucket, path, file, contentType } = options;
  const supabase = createClient();

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: contentType || file.type,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

/**
 * Upload brand logo to storage
 * Path format: {org_id}/{brand_id}/logo.{ext}
 */
export async function uploadBrandLogo(
  orgId: string,
  brandId: string,
  file: File
): Promise<UploadResult> {
  const ext = file.name.split('.').pop() || 'png';
  const path = `${orgId}/${brandId}/logo.${ext}`;

  return uploadFile({
    bucket: 'brand-assets',
    path,
    file,
    contentType: file.type,
  });
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}
