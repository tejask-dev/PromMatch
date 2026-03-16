import { supabase } from '../lib/supabase';

/**
 * Upload an image file to Supabase Storage.
 * Requires a 'profile-photos' bucket to exist in Supabase Storage (public).
 */
export const uploadToSupabase = async (file, userId) => {
  const fileExt = file.name.split('.').pop().toLowerCase();
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(fileName);

  return publicUrl;
};

/**
 * Delete a photo from Supabase Storage by public URL.
 */
export const deleteFromSupabase = async (publicUrl) => {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split('/profile-photos/');
    if (pathParts.length < 2) return;
    await supabase.storage.from('profile-photos').remove([pathParts[1]]);
  } catch {
    // Silently fail
  }
};

/**
 * Convert file to base64 data URL (for previews only)
 */
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
