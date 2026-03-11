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
import { DeliveryAssignmentRepository } from './repositories/delivery-assignment.repository';
import { DriverRepository } from './repositories/driver.repository';
import { DeliveryStateGuard } from './state/delivery-state.guard';
import { DriverStateGuard } from './state/driver-state.guard';
import { MapModule } from '../../integrations/map/map.module';

@Module({
  imports: [
    MapModule,
    MongooseModule.forFeature([
      { name: DeliveryAssignment.name, schema: DeliveryAssignmentSchema },
      { name: Driver.name, schema: DriverSchema },
    ]),
  ],
  controllers: [DeliveryController, DriverController, AdminDriverController],
  providers: [
    DeliveryService,
    DeliveryAssignmentRepository,
    DriverRepository,
    DeliveryStateGuard,
    DriverStateGuard,
  ],
  exports: [DeliveryService],
})
export class DeliveryModule {}
