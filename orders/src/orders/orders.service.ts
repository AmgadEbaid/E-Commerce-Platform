import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order, OrderStatus } from '../../entities/orders.entity';
import { OrderItem } from '../../entities/orderItem.entity';
import { Product } from '../../entities/product.entity';
import { ShoppingCart } from '../../entities/shopping-cart.entity';
import { RpcException } from '@nestjs/microservices';
import { User } from '../../entities/user.entity';
import { Address } from '../../entities/address.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(ShoppingCart)
        private readonly shoppingCartRepository: Repository<ShoppingCart>,
        private readonly entityManager: EntityManager,
    ) { }

    async createOrderFromCart(userId: string): Promise<Order> {
        return this.entityManager.transaction(async transactionalEntityManager => {
            const shoppingCart = await transactionalEntityManager.findOne(ShoppingCart, {
                where: { user: { id: userId } },
                relations: ['cartItems', 'cartItems.product'],
            });

            if (!shoppingCart || shoppingCart.cartItems.length === 0) {
                throw new RpcException('Shopping cart is empty or not found');
            }

            const user = await transactionalEntityManager.findOne(User, { where: { id: userId }, relations: ['address'] });
            if (!user) {
                throw new RpcException('User not found');
            }

            if (!user.address) {
                throw new RpcException('User address not found');
            }

            const order = new Order();
            order.userId = user.id;
            order.shippingAddress = user.address;
            order.status = OrderStatus.PENDING;
            order.items = [];

            for (const cartItem of shoppingCart.cartItems) {
                const product = await transactionalEntityManager.findOne(Product, { where: { id: cartItem.product.id }, lock: { mode: 'pessimistic_write' } });
                if (!product) {
                    throw new RpcException(`Product with ID ${cartItem.product.id} not found`);
                }

                if (product.stock < cartItem.quantity) {
                    throw new RpcException(`Insufficient stock for product: ${product.name}`);
                }


                const orderItem = new OrderItem();
                orderItem.productId = product.id;
                orderItem.productImage = product.images[0]
                orderItem.quantity = cartItem.quantity;
                orderItem.priceAtTimeOfOrder = product.price;
                orderItem.productName = product.name;

                order.items.push(orderItem);

                product.stock -= cartItem.quantity;
                await transactionalEntityManager.save(product);
            }
            const totalPrice = order.items.reduce((total, item) => total + (item.priceAtTimeOfOrder * item.quantity), 0);
            order.totalPrice = totalPrice;
            await transactionalEntityManager.save(order);
            await transactionalEntityManager.remove(shoppingCart.cartItems);


            return order;
        });
    }

    async getOrder(userId: string, orderId: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: {
                id: orderId,
                userId: userId
            },
            relations: ['items']
        });

        if (!order) {
            throw new RpcException('Order not found');
        }

        return order;
    }

    async getUserOrders(userId: string): Promise<Order[]> {
        return this.orderRepository.find({
            where: { userId: userId },
            relations: ['items'],
            order: { createdAt: 'DESC' }
        });
    }

    async updateOrderStatus(userId: string, orderId: string, status: OrderStatus): Promise<Order> {
        const order = await this.getOrder(userId, orderId);
        if (order.status === OrderStatus.CANCELLED) {
            throw new RpcException('Cancelled orders cannot be updated');
        }

        order.status = status;
        await this.orderRepository.save(order);

        return this.getOrder(userId, orderId);
    }

    async refundOrder(chargeId: string) {
        const order = await this.orderRepository.findOne({
            where: {
                latest_charge: chargeId
            },
            relations: ['items']
        });
        if (!order) {
            throw new RpcException('Order not found');
        }

        order.status = OrderStatus.REFUNDED;
        await this.orderRepository.save(order);

        return { msg: 'Order refunded successfully' };
    }

    async cancelOrder(userId: string, orderId: string): Promise<Order> {
        const order = await this.getOrder(userId, orderId);

        if (order.status !== OrderStatus.PENDING) {
            throw new RpcException('Only pending orders can be cancelled');
        }

        // Restore product stock
        for (const item of order.items) {
            const product = await this.productRepository.findOne({ where: { id: item.productId } });
            if (product) {
                product.stock += item.quantity;
                await this.productRepository.save(product);
            }
        }

        order.status = OrderStatus.CANCELLED;
        await this.orderRepository.save(order);

        return this.getOrder(userId, orderId);
    }

    async updateOrderSession(data: { orderId: string; userId: string; sessionUrl: string; PaymentSessionsId: string }): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: {
                id: data.orderId,
                userId: data.userId
            }
        });

        if (!order) {
            throw new RpcException('Order not found');
        }

        order.sessionUrl = data.sessionUrl;
        order.paymentSessionId = data.PaymentSessionsId;

        await this.orderRepository.save(order);

        return order;
    }

    async updateChargeId(chargeId: string, orderId: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: {
                id: orderId,
            }
        });

        if (!order) {
            throw new RpcException('Order not found');
        }

        order.latest_charge = chargeId;

        await this.orderRepository.save(order);

        return order;
    }

    async GetLatestCharge(data): Promise<string> {
        const order = await this.orderRepository.findOne({
            where: {
                id: data.orderId,
                userId: data.userId
            }
        });

        if (!order) {
            throw new RpcException('Order not found');
        }


        return order.latest_charge;
    }

    // Paginated retrieval of all orders for admin
    async getAllOrdersPaginated(page: number = 1, limit: number = 10): Promise<{ orders: Order[]; total: number; page: number; lastPage: number }> {
        const [orders, total] = await this.orderRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            relations: ['items'],
            order: { createdAt: 'DESC' },
        });

        const lastPage = Math.ceil(total / limit);

        return {
            orders,
            total,
            page,
            lastPage,
        };
    }
    // for admin to get order by ID
    async getOrderById(orderId: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: {
                id: orderId,
            },
            relations: ['items']
        });

        if (!order) {
            throw new RpcException('Order not found');
        }

        return order;
    }

    async updateOrderStatusById(orderId: string, status: OrderStatus): Promise<Order> {
        const order = await this.getOrderById(orderId);
        if (order.status === OrderStatus.CANCELLED) {
            throw new RpcException('Cancelled orders cannot be updated');
        }

        order.status = status;
        await this.orderRepository.save(order);

        return this.getOrderById(orderId);
    }

    async cancelOrderById(orderId: string): Promise<Order> {
        const order = await this.getOrderById(orderId);

        if (order.status !== OrderStatus.PENDING) {
            throw new RpcException('Only pending orders can be cancelled');
        }

        // Restore product stock
        for (const item of order.items) {
            const product = await this.productRepository.findOne({ where: { id: item.productId } });
            if (product) {
                product.stock += item.quantity;
                await this.productRepository.save(product);
            }
        }

        order.status = OrderStatus.CANCELLED;
        await this.orderRepository.save(order);

        return this.getOrderById(orderId);
    }
}
