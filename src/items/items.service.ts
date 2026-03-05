import { Injectable } from '@nestjs/common';
import { ItemDto } from './dto/item.dto';
import { ITEMS } from './items.config';

@Injectable()
export class ItemsService {
  findAll(): ItemDto[] {
    return ITEMS.map(({ id, name, price }) => ({ id, name, price }));
  }

  findById(id: string): ItemDto | undefined {
    const item = ITEMS.find((i) => i.id === id);
    return item
      ? { id: item.id, name: item.name, price: item.price }
      : undefined;
  }
}
