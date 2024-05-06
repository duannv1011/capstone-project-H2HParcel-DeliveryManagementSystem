import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CustomerStatusUpdateDTO {
    @ApiProperty({ example: '1', description: 'status of Customer' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for status' })
    status: number;
    @ApiProperty({ example: '1', description: 'id of Customer' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for cus_id' })
    cus_id: number;
}
