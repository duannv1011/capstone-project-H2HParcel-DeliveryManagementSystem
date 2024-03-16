import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class updateActiveDto {
    @IsNumber()
    @ApiProperty({ example: '1', description: 'warehouse_id' })
    @IsNotEmpty({ message: 'Null value warehouse_id' })
    warehouse_id: number;
}
