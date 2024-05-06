import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class createTransitRequestDto {
    @ApiProperty({ example: 1, description: 'the warehousId for transit to' })
    @IsNumber()
    @IsNotEmpty()
    warehouseTo: number;
    @ApiProperty({ example: 1, description: 'the transitShiperId for transit to' })
    @IsNumber()
    @IsNotEmpty()
    transitShiper: number;
    @ApiProperty({ example: 'quick transit befor 15h30', description: 'the note for transit' })
    @IsNumber()
    @IsNotEmpty()
    note: string;
}
