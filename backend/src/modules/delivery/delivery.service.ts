import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import {
  DeliveryAssignment,
  DeliveryAssignmentDocument,
} from './delivery-assignment.schema';
import { Driver, DriverDocument } from './driver.schema';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectModel(DeliveryAssignment.name)
    private deliveryModel: Model<DeliveryAssignmentDocument>,
    @InjectModel(Driver.name)
    private driverModel: Model<DriverDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  // TODO M3-BE-03: Implement @OnEvent('ticket.ready') handler
  @OnEvent('ticket.ready')
  async handleTicketReady(payload: { orderId: string }): Promise<void> {
    const job = await this.deliveryModel.create({
      orderId: payload.orderId,
      status: 'PENDING',
      pickupAddress: 'Restaurant Address', // TODO: Get from order/restaurant
      deliveryAddress: 'Customer Address', // TODO: Get from order
    });

    console.log(`[Delivery] Created job ${job._id} for order ${payload.orderId}`);
  }

  // TODO M3-BE-02: Implement delivery job endpoints
  async findPendingJobs(): Promise<DeliveryAssignment[]> {
    return this.deliveryModel.find({ status: 'PENDING' }).exec();
  }

  async findJobById(id: string): Promise<DeliveryAssignment | null> {
    return this.deliveryModel.findById(id).exec();
  }

  async acceptJob(id: string, driverId: string): Promise<DeliveryAssignment> {
    const job = await this.deliveryModel
      .findByIdAndUpdate(
        id,
        { status: 'ASSIGNED', driverId, acceptedAt: new Date() },
        { new: true },
      )
      .exec();

    // Emit event for Ordering module
    this.eventEmitter.emit('delivery.accepted', { orderId: job.orderId });

    return job;
  }

  async pickupJob(id: string): Promise<DeliveryAssignment> {
    return this.deliveryModel
      .findByIdAndUpdate(
        id,
        { status: 'PICKED_UP', pickedUpAt: new Date() },
        { new: true },
      )
      .exec();
  }

  async completeJob(id: string): Promise<DeliveryAssignment> {
    const job = await this.deliveryModel
      .findByIdAndUpdate(
        id,
        { status: 'DELIVERED', deliveredAt: new Date() },
        { new: true },
      )
      .exec();

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
    return this.driverModel.create({
      userId,
      vehicleType,
      licensePlate,
      phone,
      status: 'PENDING',
    });
  }

  async findAllDrivers(status?: string): Promise<Driver[]> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    return this.driverModel.find(filter).exec();
  }

  async approveDriver(id: string): Promise<Driver> {
    // TODO: Update user role to DRIVER in User collection
    return this.driverModel
      .findByIdAndUpdate(id, { status: 'APPROVED' }, { new: true })
      .exec();
  }

  async rejectDriver(id: string, reason: string): Promise<Driver> {
    return this.driverModel
      .findByIdAndUpdate(
        id,
        { status: 'REJECTED', rejectionReason: reason },
        { new: true },
      )
      .exec();
  }
}
