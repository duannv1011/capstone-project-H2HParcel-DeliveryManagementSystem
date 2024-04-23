import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChangeManagerDto {
    @ApiProperty({ example: 22, description: 'status of staffId' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for staffId' })
    staffId: number;

    @ApiProperty({ example: 22, description: 'id of wareHouseId' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for wareHouseId' })
    warehouseId: number;
}
