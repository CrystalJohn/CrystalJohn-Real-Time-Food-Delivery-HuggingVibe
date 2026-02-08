import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';

import { ConfigModule } from './infrastructure/config/config.module';
import { MongoModule } from './infrastructure/mongo/mongo.module';

import { OrderingModule } from './modules/ordering/ordering.module';
import { OrderProcessingModule } from './modules/order-processing/order-processing.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { TrackingModule } from './modules/tracking/tracking.module';

import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule,
    MongoModule,
    EventEmitterModule.forRoot(),
    AuthModule,
    OrderingModule,
    OrderProcessingModule,
    DeliveryModule,
    TrackingModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
