import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class asignShipperDto {
    @ApiProperty({ example: 1, description: 'orderId' })
    @IsString()
    @IsNotEmpty({ message: 'null value for orderId ' })
    orderId: number;

    @ApiProperty({ example: 2, description: 'shiperrId' })
    @IsString()
    shiperrId: number;
}
