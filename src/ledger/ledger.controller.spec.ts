import { Test, TestingModule } from '@nestjs/testing';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@prisma/client/sql', () => ({
  getBalance: jest.fn((userId: string) => ({ userId })),
}));

const mockLedgerService = {
  addCredit: jest.fn(),
  getBalance: jest.fn(),
};

describe('LedgerController', () => {
  let controller: LedgerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LedgerController],
      providers: [{ provide: LedgerService, useValue: mockLedgerService }],
    }).compile();

    controller = module.get<LedgerController>(LedgerController);
    jest.clearAllMocks();
  });

  describe('addCredit', () => {
    it('calls ledgerService.addCredit with userId and dto and returns result', async () => {
      const dto = { amount: 1000 };
      const expected = { balance: 1000 };
      mockLedgerService.addCredit.mockResolvedValueOnce(expected);

      const result = await controller.addCredit('user-123', dto);

      expect(mockLedgerService.addCredit).toHaveBeenCalledWith('user-123', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('getBalance', () => {
    it('calls ledgerService.getBalance with userId and returns result', async () => {
      const expected = { balance: 2000 };
      mockLedgerService.getBalance.mockResolvedValueOnce(expected);

      const result = await controller.getBalance('user-123');

      expect(mockLedgerService.getBalance).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expected);
    });
  });
});
