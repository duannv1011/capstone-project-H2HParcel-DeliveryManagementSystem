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

    @ApiProperty({ example: 'so nha 1 ngo X duong y' })
    @IsString()
    @IsOptional()
    house?: string;

    @IsNumber()
    @ApiProperty({ example: 1, description: 'city' })
    @IsOptional()
    cityId?: number;

    @IsNumber()
    @ApiProperty({ example: 1, description: 'district' })
    @IsOptional()
    districtId?: number;

    @IsNumber()
    @ApiProperty({ example: 1, description: 'ward' })
    @IsOptional()
    wardId?: number;
}
