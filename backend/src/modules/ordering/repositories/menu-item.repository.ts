import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from '../menu-item.schema';

@Injectable()
export class MenuItemRepository {
  constructor(
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
  ) {}

  async findAvailable(category?: string): Promise<MenuItem[]> {
    const filter: Record<string, unknown> = { available: true };
    if (category) {
      filter.category = category;
    }

    return this.menuItemModel.find(filter).exec();
  }

  async findById(id: string): Promise<MenuItem | null> {
    return this.menuItemModel.findById(id).exec();
  }
}
