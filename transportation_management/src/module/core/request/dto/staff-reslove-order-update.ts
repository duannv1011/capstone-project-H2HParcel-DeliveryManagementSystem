import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class StaffUpdateRequestStastus {
    @ApiProperty({ example: 1, description: 'recordId' })
    @IsNumber()
    @IsNotEmpty()
    recordId: number;
    @ApiProperty({ example: 1, description: 'requestStatus' })
    @IsNumber()
    @IsNotEmpty()
    requestStatus: number;
}
