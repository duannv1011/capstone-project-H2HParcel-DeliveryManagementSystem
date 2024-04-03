import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateAddresBookDto {
    @ApiProperty({ example: '1', description: 'bookId' })
    @IsNotEmpty({ message: 'Null value bookId' })
    @IsNumber()
    bookId: number;
    @ApiProperty({ example: 'Nguyen Van D', description: 'name' })
    @IsNotEmpty({ message: 'Null value name' })
    name: string;
    @ApiProperty({ example: '0125196112', description: 'phone' })
    @IsNotEmpty({ message: 'Null value phone' })
    phone: string;
    @ApiProperty({ example: 'so nha 120 ngo A', description: 'house' })
    @IsNotEmpty({ message: 'Null value house' })
    house: string;

    @ApiProperty({ example: '1', description: 'cityId' })
    @IsNotEmpty({ message: 'Null value cityId' })
    @IsNumber({ allowNaN: false })
    cityId: number;

    @ApiProperty({ example: '1', description: 'districtId' })
    @IsNotEmpty({ message: 'Null value districtId' })
    @IsNumber({ allowNaN: false })
    districtId: number;

    @ApiProperty({ example: '1', description: 'wardId' })
    @IsNotEmpty({ message: 'Null value wardId' })
    @IsNumber({ allowNaN: false })
    wardId: number;
}
