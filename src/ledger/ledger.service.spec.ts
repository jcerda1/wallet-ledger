import { Test, TestingModule } from '@nestjs/testing';
import { LedgerService } from './ledger.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('../../prisma/.generated/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({})),
  Type: {
    CREDIT: 'CREDIT',
    DEBIT: 'DEBIT',
  },
}));

jest.mock('../../prisma/.generated/sql', () => ({
  getBalance: jest.fn((userId: string) => ({ userId })),
}));

const mockPrisma = {
  ledger_transactions: { create: jest.fn() },
  $queryRawTyped: jest.fn(),
};

describe('LedgerService', () => {
  let service: LedgerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('returns balance as a number for a given userId', async () => {
      mockPrisma.$queryRawTyped.mockResolvedValueOnce([{ balance: 1500 }]);

      const result = await service.getBalance('user-123');

      expect(result).toEqual({ balance: 1500 });
      expect(mockPrisma.$queryRawTyped).toHaveBeenCalledTimes(1);
    });

    it('returns 0 when no transactions exist for userId', async () => {
      mockPrisma.$queryRawTyped.mockResolvedValueOnce([{ balance: null }]);

      const result = await service.getBalance('user-123');

      expect(result).toEqual({ balance: 0 });
    });

    it('returns 0 when query returns empty array', async () => {
      mockPrisma.$queryRawTyped.mockResolvedValueOnce([]);

      const result = await service.getBalance('user-123');

      expect(result).toEqual({ balance: 0 });
    });
  });

  describe('addCredit', () => {
    it('creates a CREDIT transaction and returns updated balance', async () => {
      mockPrisma.ledger_transactions.create.mockResolvedValueOnce({});
      mockPrisma.$queryRawTyped.mockResolvedValueOnce([{ balance: 1000n }]);

      const result = await service.addCredit('user-123', { amount: 1000 });

      expect(mockPrisma.ledger_transactions.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user-123',
          type: 'CREDIT',
          amount: 1000,
        },
      });
      expect(result).toEqual({ balance: 1000 });
    });

    it('calls getBalance after creating transaction', async () => {
      mockPrisma.ledger_transactions.create.mockResolvedValueOnce({});
      mockPrisma.$queryRawTyped.mockResolvedValueOnce([{ balance: 500n }]);

      const getBalanceSpy = jest.spyOn(service, 'getBalance');
      await service.addCredit('user-123', { amount: 500 });

      expect(getBalanceSpy).toHaveBeenCalledWith('user-123');
    });
  });
});
