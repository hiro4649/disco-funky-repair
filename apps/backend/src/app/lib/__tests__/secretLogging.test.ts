import fs from 'fs';
import path from 'path';

const readLibFile = (fileName: string): string =>
  fs.readFileSync(path.join(__dirname, '..', fileName), 'utf8');

describe('explorer request logging safety', () => {
  it('does not raw-log API key bearing explorer URLs from realtime holding updates', () => {
    const source = readLibFile('realtimeHoldingDateUpdater.ts');

    expect(source).not.toContain('console.log(`url: ${url}`)');
    expect(source).not.toMatch(/console\.log\([^)]*\burl\b[^)]*\)/i);
  });

  it('does not raw-log API key bearing explorer URLs from token balance helper', () => {
    const source = readLibFile('getToken.ts');

    expect(source).not.toContain('console.log("url:", apiUrl)');
    expect(source).not.toMatch(/console\.log\([^)]*\bapiUrl\b[^)]*\)/i);
  });

  it('does not keep the Ethereum mainnet explorer fallback in incremental holding updates', () => {
    const source = readLibFile('incrementalHoldingDateProcessor.ts');

    expect(source).not.toContain("https://api.etherscan.io/api?");
  });

  it('does not bypass the shared explorer API key helper in incremental holding updates', () => {
    const source = readLibFile('incrementalHoldingDateProcessor.ts');

    expect(source).not.toContain('process.env.ETHERSCAN_API_KEY');
    expect(source).toContain("if (!ETHERSCAN_API_KEY)");
  });
});
