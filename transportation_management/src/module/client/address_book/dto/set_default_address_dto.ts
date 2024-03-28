import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class setDefaultAddressDto {
    @ApiProperty({ example: '1', description: 'book_id' })
    @IsNotEmpty({ message: 'Null value book_id' })
    book_id: number;
}
