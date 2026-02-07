import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusPort } from './event-bus.port';
import { EventBusEventEmitter } from './event-bus.eventemitter';

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [
    {
      provide: EventBusPort,
      useClass: EventBusEventEmitter,
    },
  ],
  exports: [EventBusPort],
})
export class EventingModule {}
