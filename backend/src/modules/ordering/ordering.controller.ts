import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderingService } from './ordering.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { OrderItem } from './order.schema';

@Controller('menu')
export class MenuController {
  constructor(private orderingService: OrderingService) {}

  @Public()
  @Get()
  async getMenu(@Query('category') category?: string) {
    return this.orderingService.findAllMenuItems(category);
  }
}

@Controller('orders')
export class OrdersController {
  constructor(private orderingService: OrderingService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  async createOrder(
    @Req() req: any,
    @Body()
    body: {
      items: OrderItem[];
      deliveryAddress: string;
    },
  ) {
    const customerId = req.user.userId;
    return this.orderingService.createOrder(
      customerId,
      body.items,
      body.deliveryAddress,
    );
  }

  @Get('my')
  @Roles(UserRole.CUSTOMER)
  async getMyOrders(@Req() req: any) {
    const customerId = req.user.userId;
    return this.orderingService.findOrdersByCustomer(customerId);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.orderingService.findOrderById(id);
  }
}
