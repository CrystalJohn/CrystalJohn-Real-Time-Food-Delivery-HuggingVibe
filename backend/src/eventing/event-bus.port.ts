import { DomainEvent } from './domain-event.base';

export abstract class EventBusPort {
  abstract publish<T extends DomainEvent>(event: T): Promise<void>;
}
