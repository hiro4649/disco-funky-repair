import fs from 'fs';
import path from 'path';
import {
  isPublicImageAssetRequestPath,
  PUBLIC_IMAGE_ASSET_EXTENSIONS,
  rejectNonImageStaticAsset,
} from '../middlewares/publicImageAssets';

const readSource = (relativePath: string): string =>
  fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');

describe('backend runtime entrypoint hardening', () => {
  const appIndexSource = readSource('../index.ts');
  const mainSource = readSource('../../main.ts');
  const securitySource = readSource('../middlewares/security.ts');

  it('keeps server listen in main.ts only', () => {
    expect(appIndexSource).not.toMatch(/server\.listen\s*\(/);
    expect(appIndexSource).toMatch(/export const server = http\.createServer\(app\)/);
    expect(mainSource).toMatch(/listenAsync\(server/);
  });

  it('keeps tracking schedulers on the explicit main startup path', () => {
    expect(appIndexSource).not.toContain("import './services/trackingService'");
    expect(mainSource).toContain('startTrackingSchedulers()');
  });

  it('uses env-driven CORS origins and a bounded global body parser limit', () => {
    expect(appIndexSource).toContain('getCorsOrigins()');
    expect(appIndexSource).toContain('getRequestBodyLimit()');
    expect(appIndexSource).not.toContain('"1gb"');
    expect(appIndexSource).not.toContain("'http://153.127.192.241:3000'");
  });

  it('does not keep the legacy hardcoded session secret fallback', () => {
    expect(securitySource).toContain('SESSION_SECRET is required');
    expect(securitySource).not.toContain('supersecret_session_key_should_be_in_env');
  });

  it('does not keep the legacy Suiet CSP allowlist in FUNKY security middleware', () => {
    expect(securitySource).not.toContain('suiet.app');
  });

  it('does not expose the uploads root as a static directory', () => {
    expect(appIndexSource).not.toMatch(/express\.static\(\s*uploadsPath\s*\)/);

    const staticTargets = Array.from(
      appIndexSource.matchAll(/express\.static\(([^)]+)\)/g),
      ([, target]) => target.trim()
    );
    expect(staticTargets).toEqual(['imagesPath', 'imagesPath', 'imagesPath']);
  });

  it('keeps public image routes on imagesPath behind the image extension guard', () => {
    expect(appIndexSource).toContain("app.use('/uploads/images', rejectNonImageStaticAsset, express.static(imagesPath))");
    expect(appIndexSource).toContain("app.use('/api/icons/images', rejectNonImageStaticAsset, express.static(imagesPath))");
    expect(appIndexSource).toContain("app.use('/api/icons', rejectNonImageStaticAsset, express.static(imagesPath))");
    expect(appIndexSource).not.toContain("app.use('/api/icons', express.static(uploadsPath))");
  });

  it('allows only image filename extensions for public static assets', () => {
    expect(PUBLIC_IMAGE_ASSET_EXTENSIONS).toEqual(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

    for (const requestPath of ['/token.png', '/token.JPG', '/nft.jpeg', '/badge.gif', '/card.webp']) {
      expect(isPublicImageAssetRequestPath(requestPath)).toBe(true);
    }

    for (const requestPath of [
      '/sheet.xlsx',
      '/sheet.xls',
      '/export.csv',
      '/metadata.json',
      '/dump.sql',
      '/secret.env',
      '/server.log',
      '/notes.txt',
      '/temp.tmp',
      '/icon.svg',
      '/no-extension',
      '/archive.tar.gz',
    ]) {
      expect(isPublicImageAssetRequestPath(requestPath)).toBe(false);
    }
  });

  it('returns 404 before static serving for non-image public asset paths', () => {
    const end = jest.fn();
    const status = jest.fn(() => ({ end }));
    const next = jest.fn();

    rejectNonImageStaticAsset({ path: '/metadata.json' } as any, { status } as any, next);

    expect(status).toHaveBeenCalledWith(404);
    expect(end).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });
});
