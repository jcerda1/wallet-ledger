import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PrismaService } from '../prisma/prisma.service';
import { ItemsService } from '../items/items.service';

jest.mock('../../prisma/.generated/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({})),
  Type: { CREDIT: 'CREDIT', DEBIT: 'DEBIT' },
}));

jest.mock('../../prisma/.generated/sql', () => ({
  getBalance: jest.fn((userId: string) => ({ userId })),
}));

describe('PurchasesService', () => {
  let service: PurchasesService;

  const mockTx = {
    $queryRawTyped: jest.fn(),
    ledger_transactions: { create: jest.fn() },
    purchases: { create: jest.fn() },
  };

  type Tx = typeof mockTx;

  const mockPrisma = {
    $transaction: jest
      .fn()
      .mockImplementation((fn: (tx: Tx) => unknown) => fn(mockTx)),
  };
  const mockItemsService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ItemsService, useValue: mockItemsService },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
    jest.clearAllMocks();
  });

  it('throws NotFoundException when item does not exist', async () => {
    mockItemsService.findById.mockReturnValueOnce(null);

    await expect(
      service.createPurchase('user-1', { itemId: 'missing' }),
    ).rejects.toThrow(NotFoundException);

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('throws ConflictException when balance is insufficient', async () => {
    mockItemsService.findById.mockReturnValueOnce({ id: 'item-1', price: 500 });
    mockTx.$queryRawTyped.mockResolvedValueOnce([{ balance: 100n }]);

    await expect(
      service.createPurchase('user-1', { itemId: 'item-1' }),
    ).rejects.toThrow(ConflictException);

    expect(mockTx.ledger_transactions.create).not.toHaveBeenCalled();
    expect(mockTx.purchases.create).not.toHaveBeenCalled();
  });

  it('creates ledger debit and purchase when balance is sufficient', async () => {
    mockItemsService.findById.mockReturnValueOnce({ id: 'item-1', price: 100 });
    mockTx.$queryRawTyped.mockResolvedValueOnce([{ balance: 500n }]);
    mockTx.ledger_transactions.create.mockResolvedValueOnce({ id: 'tx-1' });
    mockTx.purchases.create.mockResolvedValueOnce({});

    await expect(
      service.createPurchase('user-1', { itemId: 'item-1' }),
    ).resolves.toBeUndefined();

    expect(mockTx.ledger_transactions.create).toHaveBeenCalledWith({
      data: { user_id: 'user-1', type: 'DEBIT', amount: 100 },
    });

    expect(mockTx.purchases.create).toHaveBeenCalledWith({
      data: {
        transaction_id: 'tx-1',
        item_id: 'item-1',
        item_price: 100,
      },
    });
  });
});
