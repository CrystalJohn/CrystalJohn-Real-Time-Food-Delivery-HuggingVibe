import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  // TODO M3-BE-02: Delivery job endpoints
  @Get('jobs')
  @Roles(UserRole.DRIVER)
  async getPendingJobs() {
    return this.deliveryService.findPendingJobs();
  }

  @Post('jobs/:id/accept')
  @Roles(UserRole.DRIVER)
  async acceptJob(@Param('id') id: string, @Req() req: any) {
    const driverId = req.user.userId;
    return this.deliveryService.acceptJob(id, driverId);
  }

  @Post('jobs/:id/pickup')
  @Roles(UserRole.DRIVER)
  async pickupJob(@Param('id') id: string) {
    return this.deliveryService.pickupJob(id);
  }

  @Post('jobs/:id/complete')
  @Roles(UserRole.DRIVER)
  async completeJob(@Param('id') id: string) {
    return this.deliveryService.completeJob(id);
  }
}

@Controller('drivers')
export class DriverController {
  constructor(private deliveryService: DeliveryService) {}

  // TODO M4-BE-01: Driver recruitment endpoints
  @Post('apply')
  @Roles(UserRole.CUSTOMER)
  async apply(
    @Req() req: any,
    @Body()
    body: {
      vehicleType: string;
      licensePlate: string;
      phone: string;
    },
  ) {
    const userId = req.user.userId;
    return this.deliveryService.applyAsDriver(
      userId,
      body.vehicleType,
      body.licensePlate,
      body.phone,
    );
  }
}

@Controller('admin/drivers')
export class AdminDriverController {
  constructor(private deliveryService: DeliveryService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllDrivers() {
    return this.deliveryService.findAllDrivers();
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN)
  async approveDriver(@Param('id') id: string) {
    return this.deliveryService.approveDriver(id);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN)
  async rejectDriver(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.deliveryService.rejectDriver(id, body.reason);
  }
}
