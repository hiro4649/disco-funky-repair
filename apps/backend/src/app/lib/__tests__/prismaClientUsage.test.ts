import fs from 'fs';
import path from 'path';

const appRoot = path.resolve(__dirname, '../..');
const allowedPrismaClientFactory = path.normalize('db/prisma_client.ts');

const excludedDirectories = new Set([
  '__tests__',
  '__fixtures__',
  '__mocks__',
  'fixtures',
  'generated',
  'mocks',
  'scripts'
]);

const isRuntimeSourceFile = (filePath: string) => {
  const normalized = path.relative(appRoot, filePath).replace(/\\/g, '/');
  if (!normalized.endsWith('.ts')) return false;
  if (normalized.endsWith('.test.ts') || normalized.endsWith('.spec.ts') || normalized.endsWith('.d.ts')) return false;
  return normalized !== allowedPrismaClientFactory.replace(/\\/g, '/');
};

const collectRuntimeSourceFiles = (directory: string): string[] => {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) {
        files.push(...collectRuntimeSourceFiles(entryPath));
      }
      continue;
    }

    if (entry.isFile() && isRuntimeSourceFile(entryPath)) {
      files.push(entryPath);
    }
  }

  return files;
};

describe('PrismaClient runtime usage', () => {
  it('does not instantiate PrismaClient outside the shared singleton', () => {
    const offenders = collectRuntimeSourceFiles(appRoot)
      .filter((filePath) => /\bnew\s+PrismaClient\s*\(/.test(fs.readFileSync(filePath, 'utf8')))
      .map((filePath) => path.relative(appRoot, filePath).replace(/\\/g, '/'));

    expect(offenders).toEqual([]);
  });

  it('does not disconnect the shared client from runtime request paths', () => {
    const offenders = collectRuntimeSourceFiles(appRoot)
      .filter((filePath) => /\.\$disconnect\s*\(/.test(fs.readFileSync(filePath, 'utf8')))
      .map((filePath) => path.relative(appRoot, filePath).replace(/\\/g, '/'));

    expect(offenders).toEqual([]);
  });
});
