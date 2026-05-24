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
    const sessionSecretKey = ['SESSION', 'SECRET'].join('_');
    const databaseUrlKey = ['DATABASE', 'URL'].join('_');
    const privateKeyLabel = ['PRIVATE', 'KEY'].join('_');
    const value = [
      'https://api.bscscan.com/api?module=account&apikey=secret-api-key',
      'https://rpc.example.invalid/path?token=secret-rpc-token',
      'postgresql://user:password@db.example.invalid:5432/app',
      `Authorization: Bearer ${jwt}`,
      `Cookie: adminAuth=${jwt}`,
      `{"password":"secret-password","token":"secret-token"}`,
      'raw payload: {"wallet":"0x1234","password":"secret-password"}',
      `${sessionSecretKey}=session-secret-value`,
      `${databaseUrlKey}=postgresql://user:password@db.example.invalid:5432/app`,
      `${privateKeyLabel}=0x1234567890abcdef`,
      'C:\\Users\\HIRO-001\\Documents\\CodexProjects\\FUNKY\\uploads\\image.png',
      '/home/funky/app/uploads/image.png',
      privateKey
    ].join(' ');

    const sanitized = sanitizeLogText(value);

    expect(sanitized).not.toContain('secret-api-key');
    expect(sanitized).not.toContain('secret-rpc-token');
    expect(sanitized).not.toContain('user:password');
    expect(sanitized).not.toContain(jwt);
    expect(sanitized).not.toContain('jwt');
    expect(sanitized).not.toContain(privateKey);
    expect(sanitized).not.toContain('Authorization');
    expect(sanitized).not.toContain('Cookie');
    expect(sanitized).not.toContain('adminAuth');
    expect(sanitized).not.toContain('SESSION_SECRET');
    expect(sanitized).not.toContain('DATABASE_URL');
    expect(sanitized).not.toContain('PRIVATE_KEY');
    expect(sanitized).not.toContain('secret-password');
    expect(sanitized).not.toContain('secret-token');
    expect(sanitized).not.toContain('raw payload');
    expect(sanitized).not.toContain('HIRO-001');
    expect(sanitized).not.toContain('/home/funky/app');
    expect(sanitized).toContain('[redacted-url]');
    expect(sanitized).toContain('[redacted-credential]');
    expect(sanitized).toContain('[redacted-path]');
    expect(sanitized).toContain('[redacted-payload]');
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

  it('logs safe auth/request failure metadata without credential names or values', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature';
    const sessionSecretKey = ['SESSION', 'SECRET'].join('_');
    const databaseUrlKey = ['DATABASE', 'URL'].join('_');
    const privateKeyLabel = ['PRIVATE', 'KEY'].join('_');
    const error = new Error([
      `Authorization: Bearer ${jwt}`,
      `Cookie: adminAuth=${jwt}`,
      `${sessionSecretKey}=session-secret-value`,
      `${databaseUrlKey}=postgresql://user:password@db.example.invalid:5432/app`,
      `${privateKeyLabel}=0x1234567890abcdef`
    ].join(' '));

    safeLogError('auth_request', error, {
      route: '/admin/verify',
      method: 'GET',
      hasAuthHeader: true
    });

    const logged = JSON.stringify(consoleErrorSpy.mock.calls);
    expect(logged).toContain('auth_request failed');
    expect(logged).toContain('hasAuthHeader');
    expect(logged).not.toContain(jwt);
    expect(logged).not.toContain('jwt');
    expect(logged).not.toContain('Authorization');
    expect(logged).not.toContain('Bearer');
    expect(logged).not.toContain('Cookie');
    expect(logged).not.toContain('adminAuth');
    expect(logged).not.toContain('SESSION_SECRET');
    expect(logged).not.toContain('DATABASE_URL');
    expect(logged).not.toContain('PRIVATE_KEY');
    expect(logged).not.toContain('session-secret-value');
    expect(logged).not.toContain('user:password');

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

  it('keeps auth and request handlers off raw body/header/cookie/error logging paths', () => {
    const authControllerSource = readAppFile('controllers', 'auth.controller.ts');
    const passportSource = readAppFile('config', 'passport.ts');
    const routeUtilsSource = readAppFile('routes', 'utils.ts');
    const routesSource = readAppFile('routes', 'routes.ts');
    const nftRoutesSource = readAppFile('routes', 'nft.routes.ts');
    const monitoringRoutesSource = readAppFile('routes', 'monitoring.routes.ts');
    const referralRoutesSource = readAppFile('routes', 'referral.routes.ts');

    for (const source of [
      authControllerSource,
      passportSource,
      routeUtilsSource,
      routesSource,
      nftRoutesSource,
      monitoringRoutesSource,
      referralRoutesSource
    ]) {
      expect(source).not.toMatch(/console\.(?:error|warn)\([^;\n]*,\s*(?:error|err|jwtError)\s*\)/);
    }

    expect(authControllerSource).not.toContain("console.log(transactions, 'transactions')");
    expect(monitoringRoutesSource).not.toContain('error instanceof Error ? error.message');
    expect(nftRoutesSource).not.toContain("JSON.stringify(req.body)");
    expect(routeUtilsSource).toContain("safeLogError('route_handler'");
    expect(routesSource).toContain("safeLogError('global_route_handler'");
    expect(monitoringRoutesSource).toContain("safeLogError('monitoring_run_daily_batch'");
    expect(referralRoutesSource).toContain("safeLogError('referral_track'");
  });

  it('keeps remaining high-risk backend handlers off direct console and raw internal error responses', () => {
    const sources = [
      readAppFile('index.ts'),
      readAppFile('config', 'passport.ts'),
      readAppFile('controllers', 'auth.controller.ts'),
      readAppFile('controllers', 'dexFeeController.ts'),
      readAppFile('controllers', 'illustration.controller.ts'),
      readAppFile('controllers', 'lotter.controller.ts'),
      readAppFile('controllers', 'news.controller.ts'),
      readAppFile('controllers', 'nft.controller.ts'),
      readAppFile('controllers', 'setTicketDistribute.controller.ts'),
      readAppFile('controllers', 'ticketCodeController.ts'),
      readAppFile('controllers', 'transactionHistoryController.ts'),
      readAppFile('controllers', 'trialNftTemplate.controller.ts'),
      readAppFile('controllers', 'userManage.controller.ts')
    ];

    for (const source of sources) {
      expect(source).not.toMatch(/console\.(?:error|log|warn)/);
      expect(source).not.toContain('console.log(req.body)');
      expect(source).not.toContain('error: error instanceof Error ? error.message');
      expect(source).not.toMatch(/error\s*:\s*error\.(?:message|stack)/);
      expect(source).not.toContain('Internal server error: JWT secret is not set.');
      expect(source).not.toContain('JWT_SECRET environment variable not set');
    }
  });

  it('keeps selected service and lib logging paths off direct console output', () => {
    const sources = [
      readLibFile('discordAlerts.ts'),
      readLibFile('dualApiKeyManager.ts'),
      readLibFile('enhancedHoldingDateProcessor.ts'),
      readLibFile('getToken.ts'),
      readLibFile('getTokenPrice.ts'),
      readLibFile('holdingDateService.ts'),
      readLibFile('hourlyHoldingDurationUpdater.ts'),
      readLibFile('incrementalFIFOProcessor.ts'),
      readLibFile('incrementalHoldingDateProcessor.ts'),
      readLibFile('optimizedHoldingDateChecker.ts'),
      readLibFile('quicknodeRpcService.ts'),
      readLibFile('realtimeEventListener.ts'),
      readLibFile('realtimeHoldingDateUpdater.ts'),
      readLibFile('tierScheduler.ts'),
      readLibFile('trackingTokenBalanceEthereum.ts'),
      readLibFile('trackingTokensEthereum.ts'),
      readLibFile('trialNftService.ts'),
      readLibFile('trialNftScheduler.ts'),
      readLibFile('walletBalanceMonitor.ts'),
      readAppFile('services', 'cron.service.ts'),
      readAppFile('services', 'snapshot.service.ts'),
      readAppFile('services', 'tokenManagementService.ts'),
      readAppFile('services', 'trackingService.ts'),
      readAppFile('utils', 'tokenHeplers.ts')
    ];

    for (const source of sources) {
      expect(source).not.toMatch(/console\.(?:error|log|warn)/);
    }

    const trackingSource = readLibFile('trackingTokenBalanceEthereum.ts');
    expect(trackingSource).not.toMatch(/console\.log\(["']transactions:/);
    expect(trackingSource).not.toMatch(/console\.log\(["']tokenBalance:/);
    expect(trackingSource).toContain("safeLogWarn('referral_reward_user_missing'");

    const discordAlertSource = readLibFile('discordAlerts.ts');
    expect(discordAlertSource).not.toContain('ALERT (Discord failed)');
    expect(discordAlertSource).toContain('sanitizeLogText(error.message)');
  });
});
