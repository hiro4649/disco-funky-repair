process.env.JWT_SECRET = 'test-jwt-secret';

import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const mockPrisma = {
    user: {
        findUnique: jest.fn()
    },
    admin: {
        findUnique: jest.fn()
    }
};

jest.mock('../../db/prisma_client', () => ({
    __esModule: true,
    default: mockPrisma
}));

const { Authenticate, AuthAdmin } = require('../passport') as typeof import('../passport');

type MockResponse = Response & {
    status: jest.Mock;
    json: jest.Mock;
};

const createResponse = (): MockResponse => {
    const res = {
        status: jest.fn(),
        json: jest.fn()
    } as unknown as MockResponse;

    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);

    return res;
};

const consoleOutput = (...spies: jest.SpyInstance[]) =>
    spies
        .flatMap((spy) => spy.mock.calls)
        .map((call: unknown[]) =>
            call
                .map((value: unknown) => (typeof value === 'string' ? value : JSON.stringify(value)))
                .join(' ')
        )
        .join('\n');

const responseOutput = (res: MockResponse) =>
    res.json.mock.calls
        .map((call: unknown[]) =>
            call
                .map((value: unknown) => (typeof value === 'string' ? value : JSON.stringify(value)))
                .join(' ')
        )
        .join('\n');

describe('passport authentication logging', () => {
    let logSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        logSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it('authenticates admin routes with the adminAuth cookie without logging the JWT', async () => {
        const adminToken = jwt.sign({ id: 1, email: 'admin@example.com' }, process.env.JWT_SECRET as string);
        const req = {
            cookies: {
                adminAuth: adminToken
            },
            headers: {}
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn();

        mockPrisma.admin.findUnique.mockResolvedValue({ id: 1, email: 'admin@example.com' });

        await AuthAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        const output = consoleOutput(logSpy, warnSpy, errorSpy);
        expect(output).not.toContain(adminToken);
    });

    it('does not accept an Authorization bearer token for admin authentication', async () => {
        const adminToken = jwt.sign({ id: 1, email: 'admin@example.com' }, process.env.JWT_SECRET as string);
        const req = {
            cookies: {},
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn();

        await AuthAdmin(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(mockPrisma.admin.findUnique).not.toHaveBeenCalled();

        const output = consoleOutput(logSpy, warnSpy, errorSpy);
        expect(output).not.toContain(adminToken);
        expect(output).not.toContain(`Bearer ${adminToken}`);
        expect(responseOutput(res)).not.toContain(adminToken);
    });

    it('does not log or return raw admin cookie token when verification fails', async () => {
        const rawAdminToken = 'raw-admin-token-value';
        const req = {
            cookies: {
                adminAuth: rawAdminToken
            }
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn();

        await AuthAdmin(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);

        const output = consoleOutput(logSpy, warnSpy, errorSpy);
        expect(output).not.toContain(rawAdminToken);
        expect(responseOutput(res)).not.toContain(rawAdminToken);
    });

    it('does not authorize a user JWT as an admin cookie', async () => {
        const userToken = jwt.sign({ user_id: 9, address: '0x1234567890123456789012345678901234567890' }, process.env.JWT_SECRET as string);
        const req = {
            cookies: {
                adminAuth: userToken
            },
            headers: {}
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn();

        await AuthAdmin(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(mockPrisma.admin.findUnique).not.toHaveBeenCalled();
        expect(responseOutput(res)).not.toContain(userToken);
    });

    it('does not allow body adminKey without the adminAuth cookie', async () => {
        const req = {
            body: {
                adminKey: 'legacy-admin-key'
            },
            cookies: {},
            headers: {}
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn();

        await AuthAdmin(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(mockPrisma.admin.findUnique).not.toHaveBeenCalled();
    });

    it('does not log or return raw user cookie token when verification fails', async () => {
        const rawUserToken = 'raw-user-cookie-token';
        const req = {
            cookies: {
                userAuth: rawUserToken
            },
            headers: {}
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn();

        await Authenticate(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);

        const output = consoleOutput(logSpy, warnSpy, errorSpy);
        expect(output).not.toContain(rawUserToken);
        expect(responseOutput(res)).not.toContain(rawUserToken);
    });

    it('logs only safe metadata when admin token is missing', async () => {
        const req = {
            cookies: {},
            headers: {}
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn();

        await AuthAdmin(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(warnSpy).toHaveBeenCalledWith('auth_event warning', expect.objectContaining({
            operation: 'auth_event',
            hasAdminSession: false,
            hasAuthHeader: false,
            errorMessage: 'Admin authentication missing'
        }));
    });

    it('does not log credential labels or values from auth failures', async () => {
        const rawAdminToken = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature';
        const req = {
            cookies: {
                adminAuth: rawAdminToken
            },
            headers: {
                authorization: rawAdminToken
            }
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn();

        await AuthAdmin(req, res, next);

        const output = consoleOutput(logSpy, warnSpy, errorSpy);
        expect(output).not.toContain(rawAdminToken);
        expect(output).not.toContain('Bearer');
        expect(output).not.toContain('Authorization');
        expect(output).not.toContain('adminAuth');
        expect(output).not.toContain('JWT');
        expect(output).not.toContain('jwt');
    });
});
