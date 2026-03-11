import { BadRequestException, Injectable } from '@nestjs/common';
import { TICKET_TRANSITIONS } from './ticket-transition.map';

@Injectable()
export class TicketStateGuard {
  assertTransition(currentStatus: string, nextStatus: string): void {
    if (currentStatus === nextStatus) {
      return;
    }

    const allowed = TICKET_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid ticket status transition: ${currentStatus} -> ${nextStatus}`,
      );
    }
  }
}
