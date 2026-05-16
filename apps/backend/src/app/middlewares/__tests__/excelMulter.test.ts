import fs from 'fs';
import path from 'path';

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

  it('keeps Excel metadata upload behind AuthAdmin before multer runs', () => {
    expect(nftRoutesSource).toMatch(
      /router\.post\('\/admin\/nft\/upload\/metadata',\s*AuthAdmin,\s*uploadExcel,/
    );
  });
});
