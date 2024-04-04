import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CaculataOrderPrice {
    @ApiProperty({ example: 1, description: 'pk_id' })
    @IsString()
    @IsNotEmpty({ message: 'null value for pk_id ' })
    pkId: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for pickup_ward_id' })
    @ApiProperty({ example: '1', description: 'pickup_ward_id' })
    pickupWardId: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for deliver_ward_id' })
    @ApiProperty({ example: '1', description: 'deliver_ward_id' })
    deliverWardId: number;
}
