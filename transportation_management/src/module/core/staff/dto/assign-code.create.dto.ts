import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AssignCodeCreateDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    orderId: number;

    @ApiProperty({ example: 'test_code' })
    @IsString()
    @IsNotEmpty()
    codeValue: string;
}
