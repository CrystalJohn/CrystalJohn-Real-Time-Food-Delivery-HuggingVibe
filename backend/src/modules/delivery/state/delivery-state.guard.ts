import { BadRequestException, Injectable } from '@nestjs/common';
import { DELIVERY_JOB_TRANSITIONS } from './delivery-transition.map';

@Injectable()
export class DeliveryStateGuard {
  assertJobTransition(currentStatus: string, nextStatus: string): void {
    if (currentStatus === nextStatus) {
      return;
    }

    const allowed = DELIVERY_JOB_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid delivery job transition: ${currentStatus} -> ${nextStatus}`,
      );
    }
  }
}
