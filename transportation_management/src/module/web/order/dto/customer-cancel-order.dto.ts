import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CustomerCancelOrder {
    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for order_id' })
    @ApiProperty({ example: '1', description: 'order_id' })
    order_id: number;
    @IsString()
    @IsNotEmpty({ message: 'Null value error for note' })
    @ApiProperty({ example: 'the stuff is easy to break', description: 'note' })
    note: string;
}
