import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AddresDto {
    @IsString()
    @IsNotEmpty({ message: 'Null value error for house' })
    @ApiProperty({ example: 'so nha 1 ngo X duong y', description: 'house' })
    house: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for cityid' })
    @ApiProperty({ example: '1', description: 'city_id' })
    city_id: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for districtid' })
    @ApiProperty({ example: '1', description: 'district_id' })
    district_id: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for ward_id' })
    @ApiProperty({ example: '1', description: 'ward_id' })
    ward_id: number;
}
