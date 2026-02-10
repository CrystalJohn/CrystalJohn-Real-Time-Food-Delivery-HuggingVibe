import { Module } from '@nestjs/common';
import { OrderingModule } from '../ordering/ordering.module';
import { MongooseModule } from '@nestjs/mongoose';
import { KitchenTicket, KitchenTicketSchema } from './kitchen-ticket.schema';
import { OrderProcessingService } from './order-processing.service';
import { OrderProcessingController } from './order-processing.controller';

@Module({
  imports: [
    OrderingModule,
    MongooseModule.forFeature([
      { name: KitchenTicket.name, schema: KitchenTicketSchema },
    ]),
  ],
  controllers: [OrderProcessingController],
  providers: [OrderProcessingService],
  exports: [OrderProcessingService],
})
export class OrderProcessingModule {}
