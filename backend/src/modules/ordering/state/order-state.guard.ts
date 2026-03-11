import { BadRequestException, Injectable } from '@nestjs/common';
import { ORDER_TRANSITIONS } from './order-transition.map';

@Injectable()
export class OrderStateGuard {
  assertTransition(currentStatus: string, nextStatus: string): void {
    if (currentStatus === nextStatus) {
      return;
    }

    const allowed = ORDER_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid order status transition: ${currentStatus} -> ${nextStatus}`,
      );
    }
  }
}
