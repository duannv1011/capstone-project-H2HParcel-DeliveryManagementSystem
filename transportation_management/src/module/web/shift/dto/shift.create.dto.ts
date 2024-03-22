import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class ShiftCreateArrayDto {
    @ApiProperty({ isArray: true, type: () => ShiftCreateDto })
    shiftDatas: ShiftCreateDto[];
}

export class ShiftCreateDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    staffId: number;

    @ApiProperty({ isArray: true, type: () => Shift })
    shifts: Shift[];
}

export class Shift {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    shiftId: number;

    @ApiProperty({ example: '2024-01-01' })
    @IsDate()
    @IsNotEmpty()
    day: Date;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    shift: number;
}
