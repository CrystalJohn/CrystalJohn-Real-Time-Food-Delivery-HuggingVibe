
import { Module } from '@nestjs/common';
import { TrackingGateway } from './gateways/tracking.gateway';

@Module({
  providers: [TrackingGateway],
})
export class EventsModule {}
