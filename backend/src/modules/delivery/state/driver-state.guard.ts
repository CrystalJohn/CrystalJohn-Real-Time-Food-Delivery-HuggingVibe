import { BadRequestException, Injectable } from '@nestjs/common';
import { DRIVER_TRANSITIONS } from './delivery-transition.map';

@Injectable()
export class DriverStateGuard {
  assertTransition(currentStatus: string, nextStatus: string): void {
    if (currentStatus === nextStatus) {
      return;
    }

    const allowed = DRIVER_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid driver status transition: ${currentStatus} -> ${nextStatus}`,
      );
    }
  }
}
