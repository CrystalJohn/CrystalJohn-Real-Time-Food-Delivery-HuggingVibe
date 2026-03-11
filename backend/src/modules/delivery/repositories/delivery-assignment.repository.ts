import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DeliveryAssignment,
  DeliveryAssignmentDocument,
} from '../delivery-assignment.schema';

@Injectable()
export class DeliveryAssignmentRepository {
  constructor(
    @InjectModel(DeliveryAssignment.name)
    private readonly deliveryModel: Model<DeliveryAssignmentDocument>,
  ) {}

  async create(
    orderId: string,
    pickupAddress: string,
    deliveryAddress: string,
  ): Promise<DeliveryAssignmentDocument> {
    return this.deliveryModel.create({
      orderId,
      status: 'PENDING',
      pickupAddress,
      deliveryAddress,
    });
  }

  async findPending(): Promise<DeliveryAssignment[]> {
    return this.deliveryModel.find({ status: 'PENDING' }).exec();
  }

  async findById(id: string): Promise<DeliveryAssignment | null> {
    return this.deliveryModel.findById(id).exec();
  }

  async updateById(
    id: string,
    update: Record<string, unknown>,
  ): Promise<DeliveryAssignment | null> {
    return this.deliveryModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }
}
