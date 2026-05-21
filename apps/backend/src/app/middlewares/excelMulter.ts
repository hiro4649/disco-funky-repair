import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

// Define max size (10MB for each file)
export const EXCEL_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const EXCEL_UPLOAD_ALLOWED_EXTENSIONS = ['.xlsx', '.xls'] as const;
export const EXCEL_UPLOAD_ALLOWED_MIME_TYPES = [
  '',
  'application/octet-stream',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.ms-excel',
  'application/vnd.ms-office',
  'application/x-ole-storage',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
] as const;

// Upload directory for storing files
const uploadDir = path.join(__dirname, '../../../uploads/excel');
export const EXCEL_UPLOAD_DIR = uploadDir;

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

const getAllowedExcelUploadExtension = (filename: string): typeof EXCEL_UPLOAD_ALLOWED_EXTENSIONS[number] | null => {
  const extension = path.extname(filename).toLowerCase();
  return EXCEL_UPLOAD_ALLOWED_EXTENSIONS.includes(extension as typeof EXCEL_UPLOAD_ALLOWED_EXTENSIONS[number])
    ? extension as typeof EXCEL_UPLOAD_ALLOWED_EXTENSIONS[number]
    : null;
};

export const isAllowedExcelUploadFile = (file: Pick<Express.Multer.File, 'originalname'>): boolean =>
  getAllowedExcelUploadExtension(file.originalname) !== null;

export const isAllowedExcelUploadMimeType = (mimetype?: string | null): boolean => {
  const normalized = (mimetype ?? '').trim().toLowerCase();
  return EXCEL_UPLOAD_ALLOWED_MIME_TYPES.includes(
    normalized as typeof EXCEL_UPLOAD_ALLOWED_MIME_TYPES[number]
  );
};

export const isRejectedExcelUploadMimeType = (mimetype?: string | null): boolean => {
  const normalized = (mimetype ?? '').trim().toLowerCase();
  if (isAllowedExcelUploadMimeType(normalized)) return false;

  return normalized.startsWith('image/')
    || normalized.startsWith('text/')
    || normalized === 'application/json'
    || normalized === 'application/pdf'
    || normalized === 'application/xml';
};

const xlsxZipSignatures = [
  Buffer.from([0x50, 0x4b, 0x03, 0x04]),
  Buffer.from([0x50, 0x4b, 0x05, 0x06]),
  Buffer.from([0x50, 0x4b, 0x07, 0x08])
];

const xlsOleSignature = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

const readSignatureBytes = async (filePath: string): Promise<Buffer> => {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(xlsOleSignature.length);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
};

export const validateExcelUploadSignature = async (
  filePath: string,
  extension: typeof EXCEL_UPLOAD_ALLOWED_EXTENSIONS[number]
): Promise<boolean> => {
  const signature = await readSignatureBytes(filePath);

  if (extension === '.xlsx') {
    return xlsxZipSignatures.some((expected) =>
      signature.length >= expected.length && signature.subarray(0, expected.length).equals(expected)
    );
  }

  return signature.length >= xlsOleSignature.length
    && signature.subarray(0, xlsOleSignature.length).equals(xlsOleSignature);
};

export const validatePersistedExcelFile = async (file: Express.Multer.File): Promise<void> => {
  const extension = getAllowedExcelUploadExtension(file.originalname);
  if (!extension) {
    throw new Error('Unsupported Excel upload extension');
  }

  const validSignature = await validateExcelUploadSignature(file.path, extension);
  if (!validSignature) {
    throw new Error('Invalid Excel upload signature');
  }
};

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

    if (isRejectedExcelUploadMimeType(file.mimetype)) {
      cb(new Error('Unsupported Excel upload MIME type'));
      return;
    }

    cb(null, true);
  }
}).single('file'); // Excel metadata upload expects a single `file` field.

const uploadExcel = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, async (uploadError) => {
    if (uploadError) {
      next(uploadError);
      return;
    }

    try {
      if (req.file) {
        await validatePersistedExcelFile(req.file);
      }
      next();
    } catch (error) {
      const uploadedPath = req.file?.path;
      if (uploadedPath) {
        await fs.promises.unlink(uploadedPath).catch(() => undefined);
        req.file = undefined;
      }
      next(error);
    }
  });
};

export default uploadExcel;
