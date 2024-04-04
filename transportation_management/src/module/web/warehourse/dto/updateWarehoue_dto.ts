import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateWarehouseDto {
    @IsString()
    @ApiProperty({ example: '1', description: 'The warehouse_id' })
    @IsNotEmpty({ message: 'Null value error' })
    warehouseId: number;

    @IsString()
    @ApiProperty({ example: 'warehouse_name', description: 'The warehouse_name' })
    @IsNotEmpty({ message: 'Null value error' })
    warehouseName: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error: city' })
    addressId: number;

    @IsString()
    @ApiProperty({ example: 'hourse', description: 'The hourse' })
    @IsNotEmpty({ message: 'Null value error hourse' })
    hourse: string;

    @IsNumber()
    @ApiProperty({ example: '1', description: 'The city' })
    @IsNotEmpty({ message: 'Null value error: city' })
    cityId: number;

    @IsNumber()
    @ApiProperty({ example: '4', description: 'The district' })
    @IsNotEmpty({ message: 'Null value error: district' })
    districtId: number;

    @IsNumber()
    @ApiProperty({ example: '49', description: 'The ward' })
    @IsNotEmpty({ message: 'Null value error: ward' })
    wardId: number;
}
