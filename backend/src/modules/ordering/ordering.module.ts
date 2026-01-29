import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './infrastructure/persistence/order.schema';
import { OrderMongoRepository } from './infrastructure/persistence/order.repo.mongo';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  providers: [OrderMongoRepository],
  exports: [OrderMongoRepository],
})
export class OrderingModule {}
