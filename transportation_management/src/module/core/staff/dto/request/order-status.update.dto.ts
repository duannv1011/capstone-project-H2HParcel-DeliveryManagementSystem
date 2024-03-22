import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class OrderStatusUpdateDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    orderId: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    orderStatus: number;
}
