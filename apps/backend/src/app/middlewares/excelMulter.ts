import util from 'util';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

// Define max size (10MB for each file)
export const EXCEL_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const EXCEL_UPLOAD_ALLOWED_EXTENSIONS = ['.xlsx', '.xls'] as const;

// Upload directory for storing files
const uploadDir = path.join(__dirname, '../../../uploads/excel');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: uploadDir, // Directory to save files
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  },
});

export const isAllowedExcelUploadFile = (file: Pick<Express.Multer.File, 'originalname'>): boolean =>
  EXCEL_UPLOAD_ALLOWED_EXTENSIONS.includes(
    path.extname(file.originalname).toLowerCase() as typeof EXCEL_UPLOAD_ALLOWED_EXTENSIONS[number]
  );

// Configure multer with limits and file filter (optional)
const upload = multer({
  storage: storage,
  limits: { fileSize: EXCEL_UPLOAD_MAX_BYTES }, // File size limit for each file
  fileFilter: (_req, file, cb) => {
    const allowed = isAllowedExcelUploadFile(file);
    if (!allowed) {
      cb(new Error('Unsupported Excel upload extension'));
      return;
    }

    cb(null, true);
  }
}).single('file'); // Excel metadata upload expects a single `file` field.

// Promisify the middleware for use in async functions
const uploadExcel = util.promisify(upload);
export default uploadExcel;
