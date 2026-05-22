import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  IMAGE_UPLOAD_ALLOWED_EXTENSIONS,
  findUploadedImageByOriginalName,
  persistValidatedImageFiles,
  validateImageUploadFile,
  validateImageUploadMetadata
} from '../imageUploadSecurity';

const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const jpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);

const imageFile = (
  originalname: string,
  mimetype: string,
  buffer: Buffer
): Express.Multer.File => ({
  fieldname: 'files',
  originalname,
  encoding: '7bit',
  mimetype,
  size: buffer.length,
  stream: undefined as any,
  destination: '',
  filename: '',
  path: '',
  buffer
});

describe('image upload security', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'funky-image-upload-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('allows only raster image extensions and rejects SVG metadata', () => {
    expect(IMAGE_UPLOAD_ALLOWED_EXTENSIONS).toEqual(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
    expect(validateImageUploadMetadata(imageFile('badge.svg', 'image/svg+xml', Buffer.from('<svg />'))))
      .toBe('Unsupported image upload extension');
  });

  it('requires extension, MIME, and magic bytes to agree', () => {
    expect(validateImageUploadFile(imageFile('token.png', 'image/png', pngBuffer))).toBeNull();
    expect(validateImageUploadFile(imageFile('token.jpg', 'image/jpeg', jpgBuffer))).toBeNull();
    expect(validateImageUploadFile(imageFile('token.png', 'image/jpeg', pngBuffer)))
      .toBe('Unsupported image upload MIME type');
    expect(validateImageUploadFile(imageFile('token.png', 'image/png', Buffer.from('not a png'))))
      .toBe('Unsupported image upload content');
  });

  it('stores validated images with UUID filenames and keeps an original-name lookup manifest', async () => {
    const file = imageFile('My Token.png', 'image/png', pngBuffer);

    await persistValidatedImageFiles([file], tempDir);

    expect(file.filename).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(file.filename).not.toContain('My Token');
    expect(fs.existsSync(file.path)).toBe(true);
    await expect(findUploadedImageByOriginalName('My Token.png', tempDir)).resolves.toBe(file.filename);
  });

  it('does not leave a local file when image content validation fails', async () => {
    await expect(
      persistValidatedImageFiles([imageFile('fake.png', 'image/png', Buffer.from('not a png'))], tempDir)
    ).rejects.toThrow('Unsupported image upload content');

    expect(fs.readdirSync(tempDir)).toEqual([]);
  });
});
