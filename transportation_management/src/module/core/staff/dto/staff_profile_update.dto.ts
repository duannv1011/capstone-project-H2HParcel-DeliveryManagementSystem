import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StaffProfileUpdateDto {
    @ApiProperty({ example: '1' })
    @IsNumber()
    @IsNotEmpty()
    staff_id: number;

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

    @ApiProperty({ example: '1' })
    @IsNumber()
    @IsOptional()
    warehouse_id?: number;
}
