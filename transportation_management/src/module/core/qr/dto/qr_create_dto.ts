import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class QRCreateDto {
    @ApiProperty({
        example: '1',
        description: 'The quantity of QR to create',
    })
    @Min(1, { message: 'Quantity must be at least 1' }) // Minimum value
    @Max(50, { message: 'Quantity cannot exceed 50' }) // Maximum value
    @IsNumber({ allowNaN: false, allowInfinity: false })
    @IsNotEmpty({ message: 'Null value error for quantity' })
    quantity: number;
}
