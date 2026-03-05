import { ItemsService } from './items.service';
import { ITEMS } from './items.config';

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(() => {
    service = new ItemsService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all items', () => {
    const result = service.findAll();
    expect(result).toHaveLength(ITEMS.length);
  });

  it('should return items with correct shape', () => {
    const result = service.findAll();
    result.forEach((item) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('price');
      expect(typeof item.price).toBe('number');
    });
  });

  it('should return prices as positive integers (cents)', () => {
    const result = service.findAll();
    result.forEach((item) => {
      expect(item.price).toBeGreaterThan(0);
      expect(Number.isInteger(item.price)).toBe(true);
    });
  });
});
