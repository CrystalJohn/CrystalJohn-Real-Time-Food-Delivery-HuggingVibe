import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderItem } from '../order.schema';

@Injectable()
export class OrderRepository {
  constructor(@InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>) {}

  async create(
    customerId: string,
    items: OrderItem[],
    deliveryAddress: string,
    totalAmount: number,
  ): Promise<OrderDocument> {
    return this.orderModel.create({
      customerId,
      items,
      totalAmount,
      deliveryAddress,
      status: 'PENDING',
    });
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return this.orderModel.find({ customerId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Order | null> {
    return this.orderModel.findById(id).exec();
  }

  async updateStatus(orderId: string, status: string): Promise<Order | null> {
    return this.orderModel
      .findByIdAndUpdate(orderId, { status }, { new: true })
      .exec();
  }
}
