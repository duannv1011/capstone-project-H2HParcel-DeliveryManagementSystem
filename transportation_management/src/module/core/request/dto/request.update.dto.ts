import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RequestUpdateDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    requestId: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    requestType: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    requestStatus: number;

    @ApiProperty({ example: 'note' })
    @IsString()
    @IsOptional()
    note?: string;
}
