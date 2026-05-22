const mockPrisma = {
  $transaction: jest.fn(),
  walletLoginNonce: {
    create: jest.fn(),
    findFirst: jest.fn(),
    updateMany: jest.fn()
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  },
  admin: {
    findUnique: jest.fn()
  }
};

jest.mock('../../db/prisma_client', () => ({
  __esModule: true,
  default: mockPrisma
}));

jest.mock('../../utils/rateLimiter', () => ({
  etherscanRateLimiter: {
    waitForRateLimit: jest.fn()
  }
}));

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: jest.fn()
  }
}));

import { Wallet } from 'ethers';
import bcrypt from 'bcryptjs';
import { AuthController } from '../auth.controller';

const createResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

const createRequest = (body: any, headers: Record<string, string> = {}) => ({
  body,
  cookies: {},
  get: (header: string) => headers[header.toLowerCase()]
} as any);

const createLoginMessage = (walletAddress: string, nonce = 'nonce-value') => [
  'DISCO.fan / FUNKY.fan wallet login',
  '',
  `Wallet: ${walletAddress.toLowerCase()}`,
  `Nonce: ${nonce}`,
  'Issued At: 2026-05-15T00:00:00.000Z',
  'Expires At: 2026-05-15T00:05:00.000Z',
  'Domain: funky.fan',
  'Chain ID: 56'
].join('\n');

describe('AuthController wallet signature login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
  });

  it('issues a one-time wallet login nonce with the signed message fields', async () => {
    mockPrisma.walletLoginNonce.create.mockResolvedValue({ id: 1 });
    const wallet = Wallet.createRandom();
    const res = createResponse();

    await AuthController.issueWalletNonce(
      createRequest(
        {
          wallet_address: wallet.address,
          domain: 'https://funky.fan',
          chainId: 56
        },
        { origin: 'https://funky.fan' }
      ),
      res
    );

    expect(mockPrisma.walletLoginNonce.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        wallet_address: wallet.address.toLowerCase(),
        nonce_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
        message: expect.stringContaining(`Wallet: ${wallet.address.toLowerCase()}`),
        issued_at: expect.any(Date),
        expires_at: expect.any(Date)
      })
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      wallet_address: wallet.address.toLowerCase(),
      nonce: expect.stringMatching(/^[a-f0-9]{64}$/),
      message: expect.stringContaining('Nonce:'),
      domain: 'funky.fan',
      chainId: '56'
    }));
  });

  it('does not issue JWT when only wallet address is submitted', async () => {
    const wallet = Wallet.createRandom();
    const res = createResponse();

    await AuthController.signup(createRequest({ wallet_address: wallet.address }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.cookie).not.toHaveBeenCalled();
    expect(mockPrisma.walletLoginNonce.updateMany).not.toHaveBeenCalled();
  });

  it('verifies the wallet signature, consumes the nonce once, and issues userAuth', async () => {
    const wallet = Wallet.createRandom();
    const message = createLoginMessage(wallet.address);
    const signature = await wallet.signMessage(message);
    const user = { id: 9, wallet_address: wallet.address.toLowerCase() };

    mockPrisma.walletLoginNonce.findFirst.mockResolvedValue({
      id: 3,
      expires_at: new Date(Date.now() + 60_000),
      used_at: null
    });
    mockPrisma.walletLoginNonce.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.user.findUnique.mockResolvedValue(user);
    mockPrisma.user.update.mockResolvedValue(user);

    const res = createResponse();
    await AuthController.signup(
      createRequest({
        wallet_address: wallet.address,
        message,
        signature
      }),
      res
    );

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockPrisma.walletLoginNonce.updateMany).toHaveBeenCalledWith({
      where: {
        id: 3,
        used_at: null,
        expires_at: { gt: expect.any(Date) }
      },
      data: {
        used_at: expect.any(Date),
        updated_at: expect.any(Date)
      }
    });
    expect(res.cookie).toHaveBeenCalledWith('userAuth', expect.any(String), expect.objectContaining({
      httpOnly: true,
      maxAge: 3600000
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('rejects a signature that does not match the requested wallet and does not consume nonce', async () => {
    const requestedWallet = Wallet.createRandom();
    const attackerWallet = Wallet.createRandom();
    const message = createLoginMessage(requestedWallet.address);
    const signature = await attackerWallet.signMessage(message);
    const res = createResponse();

    await AuthController.signup(
      createRequest({
        wallet_address: requestedWallet.address,
        message,
        signature
      }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockPrisma.walletLoginNonce.updateMany).not.toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it('rejects replay when the nonce was already consumed', async () => {
    const wallet = Wallet.createRandom();
    const message = createLoginMessage(wallet.address);
    const signature = await wallet.signMessage(message);

    mockPrisma.walletLoginNonce.findFirst.mockResolvedValue({
      id: 4,
      expires_at: new Date(Date.now() + 60_000),
      used_at: null
    });
    mockPrisma.walletLoginNonce.updateMany.mockResolvedValue({ count: 0 });

    const res = createResponse();
    await AuthController.signup(
      createRequest({
        wallet_address: wallet.address,
        message,
        signature
      }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.cookie).not.toHaveBeenCalled();
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });
});

describe('AuthController admin cookie session', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('sets an httpOnly admin cookie without returning the JWT in the response body', async () => {
    mockPrisma.admin.findUnique.mockResolvedValue({
      id: 7,
      email: 'admin@example.com',
      password_hash: 'hashed-password'
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = createResponse();
    await AuthController.signin(
      createRequest({
        email: 'admin@example.com',
        password: 'correct-password'
      }),
      res
    );

    expect(res.cookie).toHaveBeenCalledWith('adminAuth', expect.any(String), expect.objectContaining({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600000
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Signin successful',
      success: true
    }));
    expect(res.json.mock.calls[0][0]).not.toHaveProperty('token');
  });

  it('clears the admin cookie on logout', async () => {
    const res = createResponse();

    await AuthController.logout(createRequest({}), res);

    expect(res.clearCookie).toHaveBeenCalledWith('adminAuth', expect.objectContaining({
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    }));
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Logged out' });
  });

  it('does not log admin signin request body or credential values on backend errors', async () => {
    const credential = 'not-a-real-password-value';
    const databaseUrlKey = ['DATABASE', 'URL'].join('_');
    const sessionSecretKey = ['SESSION', 'SECRET'].join('_');
    mockPrisma.admin.findUnique.mockRejectedValue(
      new Error(`${databaseUrlKey}=postgresql://user:${credential}@db.example.invalid:5432/app ${sessionSecretKey}=${credential}`)
    );

    const res = createResponse();
    await AuthController.signin(
      createRequest({
        email: 'admin@example.com',
        password: credential,
        token: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature`
      }),
      res
    );

    const logged = JSON.stringify(errorSpy.mock.calls);
    expect(logged).toContain('admin_signin failed');
    expect(logged).toContain('emailPresent');
    expect(logged).not.toContain(credential);
    expect(logged).not.toContain('password');
    expect(logged).not.toContain('Bearer');
    expect(logged).not.toContain('DATABASE_URL');
    expect(logged).not.toContain('SESSION_SECRET');
    expect(logged).not.toContain('Authorization');
    expect(logged).not.toContain('adminAuth');
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
