import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({})),
  Type: { CREDIT: 'CREDIT', DEBIT: 'DEBIT' },
}));
jest.mock('@prisma/client/sql', () => ({ getBalance: jest.fn() }));

describe('PurchasesController', () => {
  let controller: PurchasesController;
  const mockService = { createPurchase: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasesController],
      providers: [{ provide: PurchasesService, useValue: mockService }],
    }).compile();

    controller = module.get<PurchasesController>(PurchasesController);
    jest.clearAllMocks();
  });

  it('calls service.createPurchase and returns void (204)', async () => {
    mockService.createPurchase.mockResolvedValueOnce(undefined);

    await expect(
      controller.createPurchase('user-1', { itemId: 'item-1' }),
    ).resolves.toBeUndefined();

    expect(mockService.createPurchase).toHaveBeenCalledWith('user-1', {
      itemId: 'item-1',
    });
  });
});
