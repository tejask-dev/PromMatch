// Free image upload service using Cloudinary
// Sign up at https://cloudinary.com/ for free (25GB storage, 25GB bandwidth/month)

const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset'; // Get from Cloudinary dashboard
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name'; // Get from Cloudinary dashboard

export const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Alternative: Convert to base64 for free storage in Firestore
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Alternative: Use ImgBB (completely free, no registration needed)
export const uploadToImgBB = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_API_KEY', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    throw error;
  }
};
