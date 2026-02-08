import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderItem } from './order.schema';
import { MenuItem, MenuItemDocument } from './menu-item.schema';

@Injectable()
export class OrderingService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(MenuItem.name)
    private menuItemModel: Model<MenuItemDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  // Order operations
  async createOrder(
    customerId: string,
    items: OrderItem[],
    deliveryAddress: string,
  ): Promise<Order> {
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const order = await this.orderModel.create({
      customerId,
      items,
      totalAmount,
      deliveryAddress,
      status: 'PENDING',
    });

    // Emit event for Order-Processing module
    this.eventEmitter.emit('order.placed', {
      orderId: order._id.toString(),
      items: order.items,
      customerId: order.customerId,
      deliveryAddress: order.deliveryAddress,
    });

    return order;
  }

  async findOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.orderModel.find({ customerId }).sort({ createdAt: -1 }).exec();
  }

  async findOrderById(id: string): Promise<Order | null> {
    return this.orderModel.findById(id).exec();
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return this.orderModel
      .findByIdAndUpdate(orderId, { status }, { new: true })
      .exec();
  }

  // Menu operations
  async findAllMenuItems(category?: string): Promise<MenuItem[]> {
    const filter: any = { available: true };
    if (category) {
      filter.category = category;
    }
    return this.menuItemModel.find(filter).exec();
  }

  async findMenuItemById(id: string): Promise<MenuItem | null> {
    return this.menuItemModel.findById(id).exec();
  }

  // Event handlers for cross-module communication
  @OnEvent('ticket.confirmed')
  handleTicketConfirmed(payload: { orderId: string }) {
    this.updateOrderStatus(payload.orderId, 'CONFIRMED');
  }

  @OnEvent('ticket.rejected')
  handleTicketRejected(payload: { orderId: string }) {
    this.updateOrderStatus(payload.orderId, 'CANCELLED');
  }

  @OnEvent('ticket.ready')
  handleTicketReady(payload: { orderId: string }) {
    this.updateOrderStatus(payload.orderId, 'READY');
  }

  @OnEvent('delivery.accepted')
  handleDeliveryAccepted(payload: { orderId: string }) {
    this.updateOrderStatus(payload.orderId, 'DELIVERING');
  }

  @OnEvent('delivery.delivered')
  handleDeliveryDelivered(payload: { orderId: string }) {
    this.updateOrderStatus(payload.orderId, 'DELIVERED');
  }
}
