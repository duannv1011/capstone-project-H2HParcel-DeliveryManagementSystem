import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWarehouseDto {
    @IsString()
    @ApiProperty({ example: 'warehouse_name', description: 'The warehouse_name' })
    @IsNotEmpty({ message: 'Null value error' })
    warehouse_name: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error: city' })
    address_id: number;

    @IsString()
    @ApiProperty({ example: 'hourse', description: 'The hourse' })
    @IsNotEmpty({ message: 'Null value error hourse' })
    hourse: string;

    @IsNumber()
    @ApiProperty({ example: '1', description: 'The city' })
    @IsNotEmpty({ message: 'Null value error: city' })
    city_id: number;

    @IsNumber()
    @ApiProperty({ example: '4', description: 'The district' })
    @IsNotEmpty({ message: 'Null value error: district' })
    district_id: number;

    @IsNumber()
    @ApiProperty({ example: '49', description: 'The ward' })
    @IsNotEmpty({ message: 'Null value error: ward' })
    ward_id: number;
}
