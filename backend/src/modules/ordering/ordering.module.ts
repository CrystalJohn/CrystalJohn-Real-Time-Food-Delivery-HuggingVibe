import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { MenuItem, MenuItemSchema } from './menu-item.schema';
import { OrderingService } from './ordering.service';
import { MenuController, OrdersController } from './ordering.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
  controllers: [MenuController, OrdersController],
  providers: [OrderingService],
  exports: [OrderingService],
})
export class OrderingModule {}
