import fs from 'fs';
import path from 'path';
import { safeLogError, sanitizeLogText } from '../../utils/safeLogger';

const readLibFile = (fileName: string): string =>
  fs.readFileSync(path.join(__dirname, '..', fileName), 'utf8');

const readAppFile = (...segments: string[]): string =>
  fs.readFileSync(path.join(__dirname, '..', '..', ...segments), 'utf8');

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

  it('sanitizes secret-bearing URLs, auth headers, JWTs, and private keys', () => {
    const privateKey = `0x${'a'.repeat(64)}`;
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature';
    const value = [
      'https://api.bscscan.com/api?module=account&apikey=secret-api-key',
      'https://rpc.example.invalid/path?token=secret-rpc-token',
      'postgresql://user:password@db.example.invalid:5432/app',
      `Bearer ${jwt}`,
      privateKey
    ].join(' ');

    const sanitized = sanitizeLogText(value);

    expect(sanitized).not.toContain('secret-api-key');
    expect(sanitized).not.toContain('secret-rpc-token');
    expect(sanitized).not.toContain('user:password');
    expect(sanitized).not.toContain(jwt);
    expect(sanitized).not.toContain(privateKey);
    expect(sanitized).toContain('[redacted-url]');
    expect(sanitized).toContain('Bearer [redacted]');
    expect(sanitized).toContain('[redacted-private-key]');
  });

  it('logs safe explorer failure metadata without the raw error object or API URL', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = new Error('failed https://api.bscscan.com/api?module=account&apikey=secret-api-key');

    safeLogError('explorer_fetch', error, {
      rpcUrl: 'https://rpc.example.invalid/path?token=secret-rpc-token',
      walletAddressPrefix: '0x12345678'
    });

    const logged = JSON.stringify(consoleErrorSpy.mock.calls);
    expect(logged).toContain('explorer_fetch failed');
    expect(logged).toContain('walletAddressPrefix');
    expect(logged).not.toContain('secret-api-key');
    expect(logged).not.toContain('secret-rpc-token');
    expect(logged).not.toContain('api.bscscan.com');
    expect(logged).not.toContain('rpc.example.invalid');
    expect(logged).not.toContain('apikey=');
    expect(logged).not.toContain('token=secret-rpc-token');

    consoleErrorSpy.mockRestore();
  });

  it('keeps explorer and RPC helpers on safe error logging paths', () => {
    const targets = [
      readLibFile('getToken.ts'),
      readLibFile('realtimeHoldingDateUpdater.ts'),
      readLibFile('incrementalHoldingDateProcessor.ts'),
      readLibFile('quicknodeRpcService.ts'),
      readLibFile('trackingTokenBalanceEthereum.ts'),
      readLibFile('trackingTokensEthereum.ts'),
      readLibFile('getDiscoNFTEVM.ts')
    ];

    for (const source of targets) {
      expect(source).not.toMatch(/console\.(?:error|warn)\([^;\n]*,\s*(?:error|err|parseError)\s*\)|console\.(?:error|warn)\(\s*(?:error|err|parseError)\s*\)/);
    }

    const authControllerSource = readAppFile('controllers', 'auth.controller.ts');
    expect(authControllerSource).toContain("safeLogError('auth_fetch_token_transactions'");
    expect(authControllerSource).not.toContain("console.error('Error fetching token transactions:', error)");
  });
});
