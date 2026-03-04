import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { ITEMS } from './items.config';

const mockItemsService = {
  findAll: jest
    .fn()
    .mockReturnValue(ITEMS.map(({ id, name, price }) => ({ id, name, price }))),
};

describe('ItemsController', () => {
  let controller: ItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: ItemsService, useValue: mockItemsService }],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should return all items', () => {
    const result = controller.findAll();
    expect(result).toHaveLength(ITEMS.length);
    expect(result[0]).toEqual({
      id: ITEMS[0].id,
      name: ITEMS[0].name,
      price: ITEMS[0].price,
    });
  });

  it('should return items with correct shape', () => {
    const result = controller.findAll();
    result.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('price');
    });
  });
});
