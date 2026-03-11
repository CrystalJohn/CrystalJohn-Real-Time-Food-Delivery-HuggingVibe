import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { DeliveryAssignment } from './delivery-assignment.schema';
import { Driver } from './driver.schema';
import { DeliveryAssignmentRepository } from './repositories/delivery-assignment.repository';
import { DriverRepository } from './repositories/driver.repository';
import { DeliveryStateGuard } from './state/delivery-state.guard';
import { DriverStateGuard } from './state/driver-state.guard';
import {
  MAP_GATEWAY,
  MapGateway,
} from '../../integrations/map/interfaces/map-gateway.interface';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly deliveryAssignmentRepository: DeliveryAssignmentRepository,
    private readonly driverRepository: DriverRepository,
    private readonly deliveryStateGuard: DeliveryStateGuard,
    private readonly driverStateGuard: DriverStateGuard,
    @Inject(MAP_GATEWAY)
    private readonly mapGateway: MapGateway,
    private eventEmitter: EventEmitter2,
  ) {}

  // TODO M3-BE-03: Implement @OnEvent('ticket.ready') handler
  @OnEvent('ticket.ready')
  async handleTicketReady(payload: { orderId: string }): Promise<void> {
    const pickupAddress = 'Restaurant Address'; // TODO: Get from order/restaurant
    const deliveryAddress = 'Customer Address'; // TODO: Get from order

    const estimatedEtaMinutes = await this.mapGateway.estimateEtaMinutes({
      fromAddress: pickupAddress,
      toAddress: deliveryAddress,
    });

    const job = await this.deliveryAssignmentRepository.create(
      payload.orderId,
      pickupAddress,
      deliveryAddress,
    );

    console.log(
      `[Delivery] Created job ${job._id} for order ${payload.orderId} (ETA: ${estimatedEtaMinutes}m)`,
    );
  }

  // TODO M3-BE-02: Implement delivery job endpoints
  async findPendingJobs(): Promise<DeliveryAssignment[]> {
    return this.deliveryAssignmentRepository.findPending();
  }

  async findJobById(id: string): Promise<DeliveryAssignment | null> {
    return this.deliveryAssignmentRepository.findById(id);
  }

  async acceptJob(id: string, driverId: string): Promise<DeliveryAssignment> {
    const currentJob = await this.deliveryAssignmentRepository.findById(id);
    if (!currentJob) {
      throw new NotFoundException(`Delivery job ${id} not found`);
    }

    this.deliveryStateGuard.assertJobTransition(currentJob.status, 'ASSIGNED');

    const job = await this.deliveryAssignmentRepository.updateById(id, {
      status: 'ASSIGNED',
      driverId,
      acceptedAt: new Date(),
    });
    if (!job) {
      throw new NotFoundException(`Delivery job ${id} not found`);
    }

    // Emit event for Ordering module
    this.eventEmitter.emit('delivery.accepted', { orderId: job.orderId });

    return job;
  }

  async pickupJob(id: string): Promise<DeliveryAssignment> {
    const currentJob = await this.deliveryAssignmentRepository.findById(id);
    if (!currentJob) {
      throw new NotFoundException(`Delivery job ${id} not found`);
    }

    this.deliveryStateGuard.assertJobTransition(currentJob.status, 'PICKED_UP');

    const job = await this.deliveryAssignmentRepository.updateById(id, {
      status: 'PICKED_UP',
      pickedUpAt: new Date(),
    });
    if (!job) {
      throw new NotFoundException(`Delivery job ${id} not found`);
    }

    return job;
  }

  async completeJob(id: string): Promise<DeliveryAssignment> {
    const currentJob = await this.deliveryAssignmentRepository.findById(id);
    if (!currentJob) {
      throw new NotFoundException(`Delivery job ${id} not found`);
    }

    this.deliveryStateGuard.assertJobTransition(currentJob.status, 'DELIVERED');

    const job = await this.deliveryAssignmentRepository.updateById(id, {
      status: 'DELIVERED',
      deliveredAt: new Date(),
    });
    if (!job) {
      throw new NotFoundException(`Delivery job ${id} not found`);
    }

    // Emit event for Ordering module
    this.eventEmitter.emit('delivery.delivered', { orderId: job.orderId });

    return job;
  }

  // TODO M4-BE-01: Driver registration endpoints
  async applyAsDriver(
    userId: string,
    vehicleType: string,
    licensePlate: string,
    phone: string,
  ): Promise<Driver> {
    return this.driverRepository.create(userId, vehicleType, licensePlate, phone);
  }

  async findAllDrivers(status?: string): Promise<Driver[]> {
    return this.driverRepository.findAll(status);
  }

  async approveDriver(id: string): Promise<Driver> {
    // TODO: Update user role to DRIVER in User collection
    const currentDriver = await this.driverRepository.findById(id);
    if (!currentDriver) {
      throw new NotFoundException(`Driver profile ${id} not found`);
    }

    this.driverStateGuard.assertTransition(currentDriver.status, 'APPROVED');

    const driver = await this.driverRepository.updateById(id, {
      status: 'APPROVED',
    });
    if (!driver) {
      throw new NotFoundException(`Driver profile ${id} not found`);
    }

    return driver;
  }

  async rejectDriver(id: string, reason: string): Promise<Driver> {
    const currentDriver = await this.driverRepository.findById(id);
    if (!currentDriver) {
      throw new NotFoundException(`Driver profile ${id} not found`);
    }

    this.driverStateGuard.assertTransition(currentDriver.status, 'REJECTED');

    const driver = await this.driverRepository.updateById(id, {
      status: 'REJECTED',
      rejectionReason: reason,
    });
    if (!driver) {
      throw new NotFoundException(`Driver profile ${id} not found`);
    }

    return driver;
  }
}
