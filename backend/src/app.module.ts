import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';

import { ConfigModule } from './common/configs/config.module';
import { MongoModule } from './common/database/mongo.module';

import { OrderingModule } from './modules/ordering/ordering.module';
import { OrderProcessingModule } from './modules/order-processing/order-processing.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { EventsModule } from './modules/events/events.module';

import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule,
    MongoModule,  // Database connection
    EventEmitterModule.forRoot(),
    AuthModule,
    OrderingModule,
    OrderProcessingModule,
    DeliveryModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,   // Tự động bảo vệ tất cả API
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,   // Tự động check quyền/role
    },
  ],
})
export class AppModule {}
