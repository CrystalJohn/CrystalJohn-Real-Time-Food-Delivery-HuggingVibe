import { Controller, Get, Post, Param, Body, Query, Req } from '@nestjs/common';
import { OrderProcessingService } from './order-processing.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@Controller('tickets')
export class OrderProcessingController {
  constructor(private orderProcessingService: OrderProcessingService) {}

  // TODO M2-BE-02: Implement ticket endpoints
  @Get()
  @Roles(UserRole.STAFF)
  async getAllTickets(@Query('status') status?: string) {
    return this.orderProcessingService.findAll(status);
  }

  @Get(':id')
  @Roles(UserRole.STAFF)
  async getTicketById(@Param('id') id: string) {
    return this.orderProcessingService.findById(id);
  }

  @Post(':id/accept')
  @Roles(UserRole.STAFF)
  async acceptTicket(@Param('id') id: string, @Req() req: any) {
    const staffId = req.user.userId;
    return this.orderProcessingService.acceptTicket(id, staffId);
  }

  @Post(':id/reject')
  @Roles(UserRole.STAFF)
  async rejectTicket(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { reason: string },
  ) {
    const staffId = req.user.userId;
    return this.orderProcessingService.rejectTicket(id, staffId, body.reason);
  }

  @Post(':id/ready')
  @Roles(UserRole.STAFF)
  async markReady(@Param('id') id: string) {
    return this.orderProcessingService.markReady(id);
  }
}
