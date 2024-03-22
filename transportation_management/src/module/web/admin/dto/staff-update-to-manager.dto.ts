import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class setStaffToManagerDto {
    @ApiProperty({ example: '1', description: 'warehouse of Staff' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for warehouse_id' })
    warehouse_id: number;
    @ApiProperty({ example: '1', description: 'id of Staff' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for staff_id' })
    staff_id: number;
}
