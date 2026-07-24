import multer from 'multer';
import { Request } from 'express';

// File filter checking mimetype
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF resumes are accepted. Please upload a valid PDF document.'));
  }
};

// Memory storage keeps file buffer in memory before forwarding to Cloudinary
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Single file upload parser for key 'resume'
export const uploadResume = upload.single('resume');
