import fs from 'fs';
import path from 'path';
import { EXCEL_UPLOAD_ALLOWED_EXTENSIONS, isAllowedExcelUploadFile } from '../excelMulter';

const readSource = (relativePath: string): string =>
  fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');

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
    expect(isAllowedExcelUploadFile({ originalname: 'metadata.csv' })).toBe(false);
    expect(excelMulterSource).toContain('randomUUID()');
    expect(excelMulterSource).not.toContain('originalname.replace');
  });

  it('keeps Excel metadata upload behind AuthAdmin before multer runs', () => {
    expect(nftRoutesSource).toMatch(
      /router\.post\('\/admin\/nft\/upload\/metadata',\s*AuthAdmin,\s*uploadExcel,/
    );
  });
});
