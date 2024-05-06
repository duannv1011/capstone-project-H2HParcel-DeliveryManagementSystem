import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AddresDto {
    @IsString()
    @IsNotEmpty({ message: 'Null value error for house' })
    @ApiProperty({ example: 'so nha 1 ngo X duong y', description: 'house' })
    house: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for cityid' })
    @ApiProperty({ example: '1', description: 'cityId' })
    cityId: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for districtid' })
    @ApiProperty({ example: '1', description: 'districtId' })
    districtId: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for wardId' })
    @ApiProperty({ example: '1', description: 'wardId' })
    wardId: number;
}
