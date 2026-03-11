import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { MenuItem, MenuItemSchema } from './menu-item.schema';
import { OrderingService } from './ordering.service';
import { MenuController, OrdersController } from './ordering.controller';
import { OrderRepository } from './repositories/order.repository';
import { MenuItemRepository } from './repositories/menu-item.repository';
import { OrderStateGuard } from './state/order-state.guard';
import { PaymentModule } from '../../integrations/payment/payment.module';

@Module({
  imports: [
    PaymentModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
    ]),
  ],
  controllers: [MenuController, OrdersController],
  providers: [
    OrderingService,
    OrderRepository,
    MenuItemRepository,
    OrderStateGuard,
  ],
  exports: [OrderingService],
})
export class OrderingModule {}
