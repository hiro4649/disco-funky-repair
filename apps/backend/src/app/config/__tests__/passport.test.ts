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
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        logSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it('does not log admin JWT or Authorization header during admin authentication', async () => {
        const adminToken = jwt.sign({ id: 1, email: 'admin@example.com' }, process.env.JWT_SECRET as string);
        const req = {
            cookies: {},
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn();

        mockPrisma.admin.findUnique.mockResolvedValue({ id: 1, email: 'admin@example.com' });

        await AuthAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        const output = consoleOutput(logSpy, errorSpy);
        expect(output).not.toContain(adminToken);
        expect(output).not.toContain(`Bearer ${adminToken}`);
    });

    it('does not log or return raw admin token when verification fails', async () => {
        const rawAdminToken = 'raw-admin-token-value';
        const req = {
            cookies: {},
            headers: {
                authorization: `Bearer ${rawAdminToken}`
            }
        } as unknown as Request;
        const res = createResponse();
        const next = jest.fn();

        await AuthAdmin(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);

        const output = consoleOutput(logSpy, errorSpy);
        expect(output).not.toContain(rawAdminToken);
        expect(output).not.toContain(`Bearer ${rawAdminToken}`);
        expect(responseOutput(res)).not.toContain(rawAdminToken);
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

        const output = consoleOutput(logSpy, errorSpy);
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
        expect(logSpy).toHaveBeenCalledWith('Admin authentication token missing', {
            cookiePresent: false,
            authorizationHeaderPresent: false
        });
    });
});
