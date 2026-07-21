import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the server .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
console.log('✅ CLOUDINARY_CLOUD_NAME =', process.env.CLOUDINARY_CLOUD_NAME);

// Configure Cloudinary only if credentials are provided and we are not in testing
const isTestEnv = process.env.NODE_ENV === 'test';
function hasCredentials(): boolean {
  return !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;
}

if (hasCredentials() && !isTestEnv) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Uploads a file buffer to Cloudinary using a stream.
 * Fallbacks to a mock URL in testing or if credentials are missing.
 */
export const performCloudinaryUpload = async (fileBuffer: Buffer, filename: string): Promise<any> => {
  // Generate public ID and log it (dev only)
  const generatedPublicId = `${Date.now()}-${filename.replace(/\\.pdf$/i, '')}`;
  if (process.env.NODE_ENV !== 'production') {
    console.log('Generated public_id for upload:', generatedPublicId);
  }

  // Mock response for tests or missing credentials
  if (isTestEnv || !hasCredentials()) {
    console.log('Using mock Cloudinary upload...');
    return {
      secure_url: `https://res.cloudinary.com/dummy-cloud/raw/upload/v12345/resumes/${generatedPublicId}`,
      public_id: generatedPublicId,
      resource_type: 'raw',
      type: 'upload',
      url: '',
      access_mode: 'public',
      asset_id: 'mock-asset',
      original_filename: filename,
      bytes: fileBuffer.length,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'hiretrack_resumes',
        resource_type: 'raw',
        public_id: generatedPublicId,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload stream error:', error);
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        if (!result) {
          return reject(new Error('Cloudinary upload result is undefined'));
        }
        // Detailed logging (dev only)
        if (process.env.NODE_ENV !== 'production') {
          console.log('Cloudinary upload result fields:', {
            public_id: result.public_id,
            resource_type: result.resource_type,
            type: result.type,
            secure_url: result.secure_url,
            url: result.url,
            access_mode: result.access_mode,
            asset_id: result.asset_id,
          });
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const uploadToCloudinary = async (fileBuffer: Buffer, filename: string): Promise<string> => {
  const result = await performCloudinaryUpload(fileBuffer, filename);
  // Cast to any to avoid TS18046 unknown type
  const anyResult: any = result;
  return anyResult.secure_url;
};
// Debug helper to fetch Cloudinary asset metadata (dev only)
export const getCloudinaryAssetInfo = async (publicId: string) => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('getCloudinaryAssetInfo should not be used in production');
  }
  if (!hasCredentials()) {
    console.warn('Cloudinary credentials missing; cannot fetch asset info');
    return null;
  }
  try {
    const result = await cloudinary.api.resource(publicId, { resource_type: 'raw' });
    console.log('Cloudinary asset info for', publicId, ':', {
      resource_type: result.resource_type,
      type: result.type,
      access_mode: result.access_mode,
      bytes: result.bytes,
      format: result.format,
    });
    return result;
  } catch (err) {
    console.error('Error fetching Cloudinary asset info:', err);
    throw err;
  }
};
