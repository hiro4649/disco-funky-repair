import { randomUUID } from 'crypto';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import multer from 'multer';
import path from 'path';
import type { RequestHandler } from 'express';

export const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const IMAGE_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/images');
export const IMAGE_UPLOAD_MANIFEST_FILENAME = '.image-upload-manifest.json';
export const IMAGE_UPLOAD_ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'] as const;

type AllowedImageExtension = typeof IMAGE_UPLOAD_ALLOWED_EXTENSIONS[number];
type UploadedImageManifest = Record<string, string>;
type ImageUploadFile = Express.Multer.File & {
  buffer: Buffer;
};

const allowedImageExtensions = new Set<string>(IMAGE_UPLOAD_ALLOWED_EXTENSIONS);
const imageMimeByExtension: Record<AllowedImageExtension, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
};

const imageMagicByExtension: Record<AllowedImageExtension, (buffer: Buffer) => boolean> = {
  '.png': (buffer) =>
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a,
  '.jpg': (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  '.jpeg': (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  '.gif': (buffer) =>
    buffer.length >= 6 &&
    (buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a'),
  '.webp': (buffer) =>
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGE_UPLOAD_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const validationError = validateImageUploadMetadata(file);
    if (validationError) {
      cb(new Error(validationError));
      return;
    }

    cb(null, true);
  }
});

export const normalizeImageLookupName = (imageName: string): string =>
  path.basename(imageName).replace(/\.[^/.]+$/, '').replace(/\s+/g, '_').toLowerCase();

export const getImageUploadManifestPath = (uploadDir = IMAGE_UPLOAD_DIR): string =>
  path.join(uploadDir, IMAGE_UPLOAD_MANIFEST_FILENAME);

export const createImageUploadFilename = (extension: string): string => {
  const normalizedExtension = extension.toLowerCase();
  if (!allowedImageExtensions.has(normalizedExtension)) {
    throw new Error('Unsupported image upload extension');
  }

  return `${randomUUID()}${normalizedExtension}`;
};

export const validateImageUploadMetadata = (file: Pick<Express.Multer.File, 'originalname' | 'mimetype'>): string | null => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedImageExtensions.has(extension)) {
    return 'Unsupported image upload extension';
  }

  const expectedMime = imageMimeByExtension[extension as AllowedImageExtension];
  if (file.mimetype !== expectedMime) {
    return 'Unsupported image upload MIME type';
  }

  return null;
};

export const validateImageUploadFile = (file: ImageUploadFile): string | null => {
  const metadataError = validateImageUploadMetadata(file);
  if (metadataError) return metadataError;

  const extension = path.extname(file.originalname).toLowerCase() as AllowedImageExtension;
  if (!imageMagicByExtension[extension](file.buffer)) {
    return 'Unsupported image upload content';
  }

  return null;
};

const readManifest = async (uploadDir: string): Promise<UploadedImageManifest> => {
  try {
    const manifest = await fsPromises.readFile(getImageUploadManifestPath(uploadDir), 'utf8');
    const parsed = JSON.parse(manifest);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const writeManifest = async (uploadDir: string, manifest: UploadedImageManifest): Promise<void> => {
  const manifestPath = getImageUploadManifestPath(uploadDir);
  await fsPromises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
};

const cleanupFiles = async (filePaths: string[]): Promise<void> => {
  await Promise.all(filePaths.map((filePath) => fsPromises.unlink(filePath).catch(() => undefined)));
};

export const persistValidatedImageFiles = async (
  files: ImageUploadFile[],
  uploadDir = IMAGE_UPLOAD_DIR
): Promise<void> => {
  const validationError = files.map(validateImageUploadFile).find(Boolean);
  if (validationError) {
    throw new Error(validationError);
  }

  await fsPromises.mkdir(uploadDir, { recursive: true });

  const persistedFiles: Array<{ originalLookupName: string; filename: string; path: string }> = [];
  try {
    for (const file of files) {
      const extension = path.extname(file.originalname).toLowerCase();
      const filename = createImageUploadFilename(extension);
      const filePath = path.join(uploadDir, filename);

      await fsPromises.writeFile(filePath, file.buffer, { flag: 'wx' });
      file.destination = uploadDir;
      file.filename = filename;
      file.path = filePath;

      persistedFiles.push({
        originalLookupName: normalizeImageLookupName(file.originalname),
        filename,
        path: filePath
      });
    }

    const manifest = await readManifest(uploadDir);
    for (const persistedFile of persistedFiles) {
      manifest[persistedFile.originalLookupName] = persistedFile.filename;
    }
    await writeManifest(uploadDir, manifest);
  } catch (error) {
    await cleanupFiles(persistedFiles.map((file) => file.path));
    throw error;
  }
};

export const findUploadedImageByOriginalName = async (
  imageName: string,
  uploadDir = IMAGE_UPLOAD_DIR
): Promise<string | null> => {
  const manifest = await readManifest(uploadDir);
  const filename = manifest[normalizeImageLookupName(imageName)];
  if (!filename) return null;

  const filePath = path.join(uploadDir, filename);
  return fs.existsSync(filePath) ? filename : null;
};

const collectUploadedFiles = (req: Parameters<RequestHandler>[0]): ImageUploadFile[] => {
  if (Array.isArray(req.files)) return req.files as ImageUploadFile[];
  if (req.file) return [req.file as ImageUploadFile];
  return [];
};

const finalizeImageUpload = (uploadMiddleware: RequestHandler): RequestHandler => (req, res, next) => {
  uploadMiddleware(req, res, (uploadError) => {
    if (uploadError) {
      next(uploadError);
      return;
    }

    persistValidatedImageFiles(collectUploadedFiles(req))
      .then(() => next())
      .catch(next);
  });
};

export const createMultipleImageUploadMiddleware = (fieldName: string, maxCount: number): RequestHandler =>
  finalizeImageUpload(upload.array(fieldName, maxCount));

export const createSingleImageUploadMiddleware = (fieldName: string): RequestHandler =>
  finalizeImageUpload(upload.single(fieldName));
