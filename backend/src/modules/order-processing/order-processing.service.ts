import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import { KitchenTicket, KitchenTicketDocument } from './kitchen-ticket.schema';

@Injectable()
export class OrderProcessingService {
  constructor(
    @InjectModel(KitchenTicket.name)
    private ticketModel: Model<KitchenTicketDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  // TODO M2-BE-03: Implement @OnEvent('order.placed') handler
  // Creates PENDING ticket when order is placed
  @OnEvent('order.placed')
  async handleOrderPlaced(payload: {
    orderId: string;
    items: any[];
    deliveryAddress: string;
  }): Promise<void> {
    const ticket = await this.ticketModel.create({
      orderId: payload.orderId,
      items: payload.items.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
      })),
      status: 'PENDING',
    });

    console.log(`[OrderProcessing] Created ticket ${ticket._id} for order ${payload.orderId}`);
  }

  // TODO M2-BE-02: Implement ticket endpoints logic
  async findAll(status?: string): Promise<KitchenTicket[]> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    return this.ticketModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<KitchenTicket | null> {
    return this.ticketModel.findById(id).exec();
  }

  async acceptTicket(id: string, staffId: string): Promise<KitchenTicket> {
    const ticket = await this.ticketModel
      .findByIdAndUpdate(
        id,
        { status: 'IN_PROGRESS', staffId, acceptedAt: new Date() },
        { new: true },
      )
      .exec();

    // Emit event for Ordering module
    this.eventEmitter.emit('ticket.confirmed', { orderId: ticket.orderId });

    return ticket;
  }

  async rejectTicket(
    id: string,
    staffId: string,
    reason: string,
  ): Promise<KitchenTicket> {
    const ticket = await this.ticketModel
      .findByIdAndUpdate(
        id,
        { status: 'REJECTED', staffId, rejectionReason: reason },
        { new: true },
      )
      .exec();

    // Emit event for Ordering module
    this.eventEmitter.emit('ticket.rejected', { orderId: ticket.orderId });

    return ticket;
  }

  async markReady(id: string): Promise<KitchenTicket> {
    const ticket = await this.ticketModel
      .findByIdAndUpdate(
        id,
        { status: 'READY', readyAt: new Date() },
        { new: true },
      )
      .exec();

    // Emit events for Ordering + Delivery modules
    this.eventEmitter.emit('ticket.ready', { orderId: ticket.orderId });

    return ticket;
  }
}
