import util from 'util';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define max size (10MB for each file)
const maxSize = 10 * 1024 * 1024; // 10MB

// Upload directory for storing files - use project root, not dist folder
// This ensures files persist across server restarts
const uploadDir = path.resolve(process.cwd(), 'uploads/images');
console.log('📁 NFT Images upload directory:', uploadDir);

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: uploadDir, // Directory to save files
  filename: (req, file, cb) => {
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, `${Date.now()}----${file.originalname.replace(/\s+/g, '_')}`); // Rename file to avoid conflicts
  },
});

// Configure multer with limits and file filter (optional)
const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize }, // File size limit for each file
}).array('files', 10); // 'files' is the name of the input field, allows up to 10 files

// Promisify the middleware for use in async functions
const uploadMultipleFiles = util.promisify(upload);
export default uploadMultipleFiles;