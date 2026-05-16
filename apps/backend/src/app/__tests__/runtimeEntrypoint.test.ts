import fs from 'fs';
import path from 'path';

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
});
