import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class setStaffToManagerDto {
    @ApiProperty({ example: '1', description: 'warehouse of Staff' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for warehouseId' })
    warehouseId: number;
    @ApiProperty({ example: '1', description: 'id of Staff' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for staffId' })
    staffId: number;
}
