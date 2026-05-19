import fs from 'fs';
import path from 'path';

const frontendRoot = path.resolve(__dirname, '../../../../frontend');

const readFrontendFile = (relativePath: string) =>
  fs.readFileSync(path.join(frontendRoot, relativePath), 'utf8');

describe('frontend admin cookie-only session boundary', () => {
  it('does not keep admin token fields or actions in Redux/admin signin flow', () => {
    const adminSlice = readFrontendFile('src/store/slices/adminSlice.ts');
    const signin = readFrontendFile('src/components/Auth/Signin/index.tsx');
    const adminLayout = readFrontendFile('src/components/Layouts/AdminLayout.tsx');

    for (const source of [adminSlice, signin, adminLayout]) {
      expect(source).not.toMatch(/\badminToken\b/);
      expect(source).not.toMatch(/\bsetAdminToken\b/);
    }
  });

  it('does not write admin tokens to browser storage or default Authorization headers', () => {
    const adminSources = [
      readFrontendFile('src/components/Auth/Signin/index.tsx'),
      readFrontendFile('src/components/Layouts/AdminLayout.tsx'),
      readFrontendFile('src/store/slices/adminSlice.ts'),
      readFrontendFile('utils/apiClient.ts')
    ].join('\n');

    expect(adminSources).not.toMatch(/(?:localStorage|sessionStorage)\.(?:setItem|getItem)\([^)]*admin[^)]*token/i);
    expect(adminSources).not.toMatch(/headers\.common\[['"]Authorization['"]\]\s*=/);
    expect(fs.existsSync(path.join(frontendRoot, 'utils/setAuthToken.ts'))).toBe(false);
  });
});
