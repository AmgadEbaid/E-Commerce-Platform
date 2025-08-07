import { Controller, Post, Get, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VerifiedGuard } from '../auth/guards/verified.guard';
import { OrdersService } from './orders.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from 'src/entities/user.entity';


@UseGuards(AuthGuard('jwt'), VerifiedGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'), VerifiedGuard)
    async createOrder(@Request() req) {
        return this.ordersService.createOrderFromCart(req.user.id);
    }

    @Get(':orderId')
    @UseGuards(AuthGuard('jwt'), VerifiedGuard)
    async getOrder(@Request() req, @Param('orderId') orderId: string) {
        return this.ordersService.getOrder(req.user.id, orderId);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), VerifiedGuard)
    async getUserOrders(@Request() req) {
        return this.ordersService.getUserOrders(req.user.id);
    }

    @Put(':orderId/status')
    async updateOrderStatus(
        @Request() req,
        @Param('orderId') orderId: string,
        @Body('status') status: string
    ) {
        return this.ordersService.updateOrderStatus(req.user.id, orderId, status);
    }

    @Delete(':orderId')
    @UseGuards(AuthGuard('jwt'), VerifiedGuard)
    async cancelOrder(@Request() req, @Param('orderId') orderId: string) {
        return this.ordersService.cancelOrder(req.user.id, orderId);
    }

    @Get('admin/all')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getAllOrders(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.ordersService.getAllOrdersPaginated(page, limit);
    }

    @Get('admin/:orderId')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getOrderById(@Param('orderId') orderId: string) {
        return this.ordersService.getOrderById(orderId);
    }
}
