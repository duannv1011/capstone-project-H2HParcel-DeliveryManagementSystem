import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
    @IsString()
    @IsNotEmpty({ message: 'Null value error for amount' })
    @ApiProperty({ example: '100000', description: 'The amount' })
    amount: string;
    @IsString()
    @IsNotEmpty({ message: 'Null value error for bankCode' })
    @ApiProperty({ example: 'BNC', description: 'The bankCode' })
    bankCode: string;
    @IsString()
    @IsNotEmpty({ message: 'Null value error for amount' })
    @ApiProperty({ example: 'VN', description: 'The amount' })
    language: string;
}
