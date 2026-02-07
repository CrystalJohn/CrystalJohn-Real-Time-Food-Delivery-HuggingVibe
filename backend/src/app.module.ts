import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { ConfigModule } from './infrastructure/config/config.module';
import { MongoModule } from './infrastructure/mongo/mongo.module';
import { EventingModule } from './eventing/eventing.module';

import { OrderingModule } from './modules/ordering/ordering.module';
import { OrderProcessingModule } from './modules/order-processing/order-processing.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { TrackingModule } from './modules/tracking/tracking.module';

import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    MongoModule,
    EventingModule,
    AuthModule,
    OrderingModule,
    OrderProcessingModule,
    DeliveryModule,
    TrackingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
