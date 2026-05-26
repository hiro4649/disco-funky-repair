import fs from 'fs';
import path from 'path';

const backendRoot = path.resolve(__dirname, '../../../../');

const readText = (fileName: string) => fs.readFileSync(path.join(backendRoot, fileName), 'utf8');

describe('backend Docker runtime artifact', () => {
  const packageJson = JSON.parse(readText('package.json'));
  const dockerfile = readText('Dockerfile');
  const dockerfileDev = readText('Dockerfile.dev');

  it('defines the scripts used by Docker runtime entrypoints', () => {
    expect(packageJson.scripts['start:prod']).toBe('node ./dist/src/main.js');
    expect(packageJson.scripts['start:dev']).toContain('tsc-watch -p tsconfig.build.json');
    expect(packageJson.scripts.prod).toBe('npm run start:prod');
    expect(packageJson.main).toBe('dist/src/main.js');
  });

  it('builds production image with Node 20, npm lockfile, and Prisma schema before build', () => {
    expect(dockerfile).toContain('FROM node:20-alpine AS builder');
    expect(dockerfile).toContain('FROM node:20-alpine AS final');
    expect(dockerfile).toContain('COPY package.json package-lock.json ./');
    expect(dockerfile).toContain('RUN npm ci');
    expect(dockerfile).not.toContain('yarn');

    const prismaCopyIndex = dockerfile.indexOf('COPY prisma ./prisma');
    const buildIndex = dockerfile.indexOf('RUN npm run build');
    expect(prismaCopyIndex).toBeGreaterThanOrEqual(0);
    expect(buildIndex).toBeGreaterThan(prismaCopyIndex);

    expect(dockerfile).toContain('COPY --from=builder /app/dist ./dist');
    expect(dockerfile).toContain('CMD ["npm", "run", "start:prod"]');
  });

  it('uses the existing dev script and copies Prisma schema in the dev image', () => {
    expect(dockerfileDev).toContain('FROM node:20-alpine');
    expect(dockerfileDev).toContain('COPY package.json package-lock.json ./');
    expect(dockerfileDev).toContain('COPY prisma ./prisma');
    expect(dockerfileDev).toContain('RUN npm ci');
    expect(dockerfileDev).toContain('CMD ["npm", "run", "start:dev"]');
    expect(dockerfileDev).not.toContain('yarn');
  });
});
