import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CustomerEditOrder {
    @ApiProperty({ example: 100, description: 'the orderId of order' })
    @IsNumber()
    @IsNotEmpty({ message: 'null value for orderId ' })
    orderId: number;

    @ApiProperty({ example: 1, description: 'deliverInforId' })
    @IsString()
    @IsNotEmpty({ message: 'null value for deliverInforId ' })
    deliverInforId: number;
    @IsString()
    @IsNotEmpty({ message: 'Null value error for newPrice' })
    @ApiProperty({ example: '50000', description: 'newPrice' })
    newPrice: string;

    @IsString()
    @IsNotEmpty({ message: 'Null value error for note' })
    @ApiProperty({ example: 'the stuff is easy to break', description: 'note' })
    note: string;
}
