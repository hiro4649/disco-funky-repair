import fs from 'fs';
import path from 'path';
import express from 'express';
const request = require('supertest');

import uploadExcel, {
  EXCEL_UPLOAD_ALLOWED_EXTENSIONS,
  EXCEL_UPLOAD_DIR,
  EXCEL_UPLOAD_MAX_BYTES,
  isAllowedExcelUploadFile,
  isAllowedExcelUploadMimeType,
  isRejectedExcelUploadMimeType
} from '../excelMulter';

const readSource = (relativePath: string): string =>
  fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');

const xlsxBuffer = () => Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]);
const xlsBuffer = () => Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00]);
const invalidBuffer = () => Buffer.from('not an excel payload marker');

const listUploadFiles = (): Set<string> =>
  new Set(fs.existsSync(EXCEL_UPLOAD_DIR) ? fs.readdirSync(EXCEL_UPLOAD_DIR) : []);

const diffSets = (before: Set<string>, after: Set<string>): string[] =>
  [...after].filter((filename) => !before.has(filename));

const createUploadApp = () => {
  const app = express();

  app.post('/upload', uploadExcel, (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Missing file' });
    }

    const response = {
      success: true,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      existedBeforeCleanup: fs.existsSync(file.path)
    };

    fs.unlinkSync(file.path);
    return res.status(200).json(response);
  });

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) =>
    res.status(400).json({
      success: false,
      error: 'Invalid Excel upload'
    })
  );

  return app;
};

describe('Excel upload middleware hardening', () => {
  const excelMulterSource = readSource('../excelMulter.ts');
  const nftRoutesSource = readSource('../../routes/nft.routes.ts');

  it('keeps the Excel upload limit at 10MB instead of 1GB', () => {
    expect(excelMulterSource).toContain('EXCEL_UPLOAD_MAX_BYTES = 10 * 1024 * 1024');
    expect(excelMulterSource).toContain('limits: { fileSize: EXCEL_UPLOAD_MAX_BYTES }');
    expect(excelMulterSource).not.toContain('1000 * 1024 * 1024');
  });

  it('allows only .xlsx and .xls uploads with UUID filenames', () => {
    expect(EXCEL_UPLOAD_ALLOWED_EXTENSIONS).toEqual(['.xlsx', '.xls']);
    expect(isAllowedExcelUploadFile({ originalname: 'metadata.xlsx' })).toBe(true);
    expect(isAllowedExcelUploadFile({ originalname: 'metadata.xls' })).toBe(true);
    expect(isAllowedExcelUploadFile({ originalname: 'metadata.svg' })).toBe(false);
    expect(isAllowedExcelUploadFile({ originalname: 'metadata.png' })).toBe(false);
    expect(isAllowedExcelUploadFile({ originalname: 'metadata.txt' })).toBe(false);
    expect(isAllowedExcelUploadFile({ originalname: 'metadata' })).toBe(false);
    expect(isAllowedExcelUploadFile({ originalname: 'metadata.csv' })).toBe(false);
    expect(excelMulterSource).toContain('randomUUID()');
    expect(excelMulterSource).not.toContain('originalname.replace');
  });

  it('keeps MIME checks advisory and rejects known non-Excel upload MIME types', () => {
    expect(isAllowedExcelUploadMimeType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe(true);
    expect(isAllowedExcelUploadMimeType('application/vnd.ms-excel')).toBe(true);
    expect(isAllowedExcelUploadMimeType('application/octet-stream')).toBe(true);
    expect(isAllowedExcelUploadMimeType('')).toBe(true);
    expect(isRejectedExcelUploadMimeType('image/png')).toBe(true);
    expect(isRejectedExcelUploadMimeType('text/plain')).toBe(true);
    expect(isRejectedExcelUploadMimeType('application/x-custom-excel')).toBe(false);
  });

  it('keeps Excel metadata upload behind AuthAdmin before multer runs', () => {
    expect(nftRoutesSource).toMatch(
      /router\.post\('\/admin\/nft\/upload\/metadata',\s*AuthAdmin,\s*uploadExcel,/
    );
  });

  it('accepts .xlsx uploads with a PK ZIP signature and stores with UUID filename', async () => {
    const response = await request(createUploadApp())
      .post('/upload')
      .attach('file', xlsxBuffer(), {
        filename: '../unsafe original.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

    expect(response.status).toBe(200);
    expect(response.body.filename).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.xlsx$/i
    );
    expect(response.body.filename).not.toContain('unsafe original');
    expect(response.body.existedBeforeCleanup).toBe(true);
  });

  it('accepts .xls uploads with an OLE compound file signature', async () => {
    const response = await request(createUploadApp())
      .post('/upload')
      .attach('file', xlsBuffer(), {
        filename: 'metadata.xls',
        contentType: 'application/vnd.ms-excel'
      });

    expect(response.status).toBe(200);
    expect(response.body.filename).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.xls$/i
    );
  });

  it.each([
    ['.xlsx', 'metadata.xlsx'],
    ['.xls', 'metadata.xls']
  ])('rejects %s uploads with an invalid signature and leaves no saved file', async (_extension, filename) => {
    const before = listUploadFiles();

    const response = await request(createUploadApp())
      .post('/upload')
      .attach('file', invalidBuffer(), {
        filename,
        contentType: 'application/octet-stream'
      });

    const after = listUploadFiles();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, error: 'Invalid Excel upload' });
    expect(JSON.stringify(response.body)).not.toContain(EXCEL_UPLOAD_DIR);
    expect(JSON.stringify(response.body)).not.toContain('not an excel payload marker');
    expect(diffSets(before, after)).toEqual([]);
  });

  it.each([
    ['metadata.svg', 'image/svg+xml'],
    ['metadata.png', 'image/png'],
    ['metadata.txt', 'text/plain'],
    ['metadata', 'application/octet-stream']
  ])('rejects unsupported extension %s without exposing local paths or payloads', async (filename, contentType) => {
    const response = await request(createUploadApp())
      .post('/upload')
      .attach('file', invalidBuffer(), { filename, contentType });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, error: 'Invalid Excel upload' });
    expect(JSON.stringify(response.body)).not.toContain(EXCEL_UPLOAD_DIR);
    expect(JSON.stringify(response.body)).not.toContain('not an excel payload marker');
  });

  it('keeps the 10MB upload limit active in middleware configuration', () => {
    expect(EXCEL_UPLOAD_MAX_BYTES).toBe(10 * 1024 * 1024);
  });
});
