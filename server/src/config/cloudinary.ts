import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary only if credentials are provided and we are not in testing
const isTestEnv = process.env.NODE_ENV === 'test';
const hasCredentials = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (hasCredentials && !isTestEnv) {
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
export const uploadToCloudinary = (fileBuffer: Buffer, filename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Mock response if in tests or credentials are empty
    if (isTestEnv || !hasCredentials) {
      console.log('Using mock Cloudinary upload...');
      return resolve(`https://res.cloudinary.com/dummy-cloud/raw/upload/v12345/resumes/${Date.now()}-${filename}`);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'hiretrack_resumes',
        resource_type: 'raw', // Keep as raw to preserve PDF format
        public_id: `${Date.now()}-${filename.replace(/\.pdf$/i, '')}`,
        format: 'pdf'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload stream error:', error);
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        if (!result) {
          return reject(new Error('Cloudinary upload result is undefined'));
        }
        resolve(result.secure_url);
      }
    );

    // Write buffer to stream
    uploadStream.end(fileBuffer);
  });
};
