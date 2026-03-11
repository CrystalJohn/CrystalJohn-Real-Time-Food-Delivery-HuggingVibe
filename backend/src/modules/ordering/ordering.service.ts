import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Order, OrderItem } from './order.schema';
import { MenuItem } from './menu-item.schema';
import { MenuItemRepository } from './repositories/menu-item.repository';
import { OrderRepository } from './repositories/order.repository';
import { OrderStateGuard } from './state/order-state.guard';
import {
  PAYMENT_GATEWAY,
  PaymentGateway,
  PaymentMethod,
} from '../../integrations/payment/interfaces/payment-gateway.interface';

@Injectable()
export class OrderingService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly menuItemRepository: MenuItemRepository,
    private readonly orderStateGuard: OrderStateGuard,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGateway,
    private eventEmitter: EventEmitter2,
  ) {}

  // Order operations
  async createOrder(
    customerId: string,
    items: OrderItem[],
    deliveryAddress: string,
    paymentMethod: PaymentMethod = 'COD',
  ): Promise<Order> {
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const order = await this.orderRepository.create(
      customerId,
      items,
      deliveryAddress,
      totalAmount,
    );

    if (paymentMethod === 'ONLINE') {
      const paymentResult = await this.paymentGateway.charge({
        orderId: order._id.toString(),
        amount: totalAmount,
        method: paymentMethod,
      });

      if (!paymentResult.success) {
        await this.updateOrderStatus(order._id.toString(), 'CANCELLED');
        throw new InternalServerErrorException(
          paymentResult.errorMessage || 'Payment processing failed',
        );
      }
    }

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
    return this.orderRepository.findByCustomer(customerId);
  }

  async findOrderById(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const currentOrder = await this.orderRepository.findById(orderId);
    if (!currentOrder) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    this.orderStateGuard.assertTransition(currentOrder.status, status);

    const updated = await this.orderRepository.updateStatus(orderId, status);
    if (!updated) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return updated;
  }

  // Menu operations
  async findAllMenuItems(category?: string): Promise<MenuItem[]> {
    return this.menuItemRepository.findAvailable(category);
  }

  async findMenuItemById(id: string): Promise<MenuItem | null> {
    return this.menuItemRepository.findById(id);
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
