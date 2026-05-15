const mockPrisma = {
  $transaction: jest.fn(),
  ticketCode: {
    findUnique: jest.fn(),
    updateMany: jest.fn()
  },
  user: {
    findFirst: jest.fn(),
    update: jest.fn()
  }
};

jest.mock('../../db/prisma_client', () => ({
  __esModule: true,
  default: mockPrisma
}));

import { claimTicketCode } from '../ticketCodeController';

const createResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createRequest = (body: any) => ({ body } as any);
const activeTicketCode = () => ({
  id: 1,
  code: 'AbCdEf1234',
  status: 'PENDING',
  created_at: new Date()
});

describe('claimTicketCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
  });

  it('claims a pending ticket code inside a transaction and increments tickets once', async () => {
    mockPrisma.ticketCode.findUnique.mockResolvedValue(activeTicketCode());
    mockPrisma.user.findFirst.mockResolvedValue({ id: 10 });
    mockPrisma.ticketCode.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.user.update.mockResolvedValue({ tickets: 4 });

    const res = createResponse();
    await claimTicketCode(createRequest({ code: 'AbCdEf1234', wallet_address: '0xUser' }), res);

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockPrisma.ticketCode.updateMany).toHaveBeenCalledWith({
      where: {
        id: 1,
        status: 'PENDING'
      },
      data: {
        status: 'CLAIMED',
        claimed_at: expect.any(Date),
        wallet_address: '0xuser'
      }
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: {
        tickets: {
          increment: 1
        }
      },
      select: { tickets: true }
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Ticket code claimed successfully',
      data: {
        new_ticket_balance: 4
      }
    });
  });

  it('allows only one successful claim when two requests race for the same code', async () => {
    mockPrisma.ticketCode.findUnique.mockResolvedValue(activeTicketCode());
    mockPrisma.user.findFirst.mockResolvedValue({ id: 10 });
    mockPrisma.ticketCode.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });
    mockPrisma.user.update.mockResolvedValue({ tickets: 4 });

    const firstResponse = createResponse();
    const secondResponse = createResponse();

    await Promise.all([
      claimTicketCode(createRequest({ code: 'AbCdEf1234', wallet_address: '0xUser' }), firstResponse),
      claimTicketCode(createRequest({ code: 'AbCdEf1234', wallet_address: '0xUser' }), secondResponse)
    ]);

    const statuses = [
      firstResponse.status.mock.calls[0][0],
      secondResponse.status.mock.calls[0][0]
    ].sort();

    expect(statuses).toEqual([200, 400]);
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
  });

  it('marks expired pending codes as expired and does not increment tickets', async () => {
    mockPrisma.ticketCode.findUnique.mockResolvedValue({
      ...activeTicketCode(),
      created_at: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)
    });
    mockPrisma.ticketCode.updateMany.mockResolvedValue({ count: 1 });

    const res = createResponse();
    await claimTicketCode(createRequest({ code: 'AbCdEf1234', wallet_address: '0xUser' }), res);

    expect(mockPrisma.ticketCode.updateMany).toHaveBeenCalledWith({
      where: {
        id: 1,
        status: 'PENDING'
      },
      data: { status: 'EXPIRED' }
    });
    expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Ticket code has expired'
    });
  });
});
