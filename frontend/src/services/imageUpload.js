import { supabase } from '../lib/supabase';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

/**
 * Upload an image file to Supabase Storage.
 * Validates MIME type, file size, and uses a cryptographically random filename.
 */
export const uploadToSupabase = async (file, userId) => {
  // --- Client-side validation ---
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be under 8 MB');
  }

  // Use cryptographically secure random ID — never Math.random()
  const randomId = crypto.randomUUID();
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const fileName = `${userId}/${randomId}.${ext}`;

  const { error } = await supabase.storage
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
    const parts = url.pathname.split('/profile-photos/');
    if (parts.length < 2) return;
    const { error } = await supabase.storage.from('profile-photos').remove([parts[1]]);
    if (error) console.warn('Photo delete warning:', error.message);
  } catch (e) {
    console.warn('Photo delete error:', e.message);
  }
};

/**
 * Convert file to base64 data URL (local preview only — never stored in DB).
 */
export const convertToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
