import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StaffProfileUpdateDto {
    @ApiProperty({ example: 'test' })
    @IsString()
    @IsOptional()
    fullname?: string;

    @ApiProperty({ example: 'test@test.com' })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiProperty({ example: '0123456789' })
    @IsString()
    @IsOptional()
    phone?: string;

    //@ApiProperty({ example: 1 })
    @IsNumber()
    @IsOptional()
    addressId?: number;

    @ApiProperty({ example: 'so nha 1 ngo X duong y' })
    @IsString()
    @IsOptional()
    house?: string;

    @IsNumber()
    @ApiProperty({ example: '1', description: 'city' })
    @IsOptional()
    city_id?: number;

    @IsNumber()
    @ApiProperty({ example: '1', description: 'district' })
    @IsOptional()
    district_id?: number;

    @IsNumber()
    @ApiProperty({ example: '1', description: 'ward' })
    @IsOptional()
    ward_id?: number;
}
