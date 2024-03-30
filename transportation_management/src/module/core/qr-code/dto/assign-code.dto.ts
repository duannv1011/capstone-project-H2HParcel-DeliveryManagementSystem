import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AssignCodeDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    orderId: number;

    @ApiProperty({ example: 'qrcode0_21-03-2024_1710972089885' })
    @IsString()
    @IsNotEmpty()
    codeValue: string;
}
