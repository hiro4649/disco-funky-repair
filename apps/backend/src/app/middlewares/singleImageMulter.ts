import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define max size (10MB for each file)
const maxSize = 10 * 1024 * 1024;

// Upload directory for storing files - use project root, not dist folder
const uploadDir = path.resolve(process.cwd(), 'uploads/images');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}----${file.originalname.replace(/\s+/g, '_')}`);
  },
});

// Configure multer with limits - accepts 'file' or 'image' field name
const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
});

// Export as Express middleware for single image upload
export const uploadSingleImage = upload.single('image');
export const uploadSingleFile = upload.single('file');
export default uploadSingleImage;
