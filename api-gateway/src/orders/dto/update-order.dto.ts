import { IsEnum, IsNotEmpty } from 'class-validator';

export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    REFUNDED = 'refunded',
    
}

export class UpdateOrderStatusDto {

    @IsNotEmpty()
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
