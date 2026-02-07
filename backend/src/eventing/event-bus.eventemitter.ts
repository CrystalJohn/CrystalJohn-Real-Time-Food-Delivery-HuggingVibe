import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventBusPort } from './event-bus.port';
import { DomainEvent } from './domain-event.base';

@Injectable()
export class EventBusEventEmitter implements EventBusPort {
  private readonly logger = new Logger(EventBusEventEmitter.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const eventName = event.constructor.name;
    this.logger.log(`Publishing event: ${eventName}`);
    await this.eventEmitter.emitAsync(eventName, event);
  }
}
