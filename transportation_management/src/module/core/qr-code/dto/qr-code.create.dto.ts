import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class QrCodeCreateDto {
    @ApiProperty({ example: 10 })
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(50)
    quantity: number;
}
