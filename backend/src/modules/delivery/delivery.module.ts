import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeliveryAssignment,
  DeliveryAssignmentSchema,
} from './delivery-assignment.schema';
import { Driver, DriverSchema } from './driver.schema';
import { DeliveryService } from './delivery.service';
import {
  DeliveryController,
  DriverController,
  AdminDriverController,
} from './delivery.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryAssignment.name, schema: DeliveryAssignmentSchema },
      { name: Driver.name, schema: DriverSchema },
    ]),
  ],
  controllers: [DeliveryController, DriverController, AdminDriverController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
