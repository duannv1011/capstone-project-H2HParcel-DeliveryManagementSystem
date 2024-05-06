import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class QrCodeListDto {
    @ApiProperty({ example: '["qrcode0_21-03-2024_1710972089885", "qrcode0_21-03-2024_1710982742195"]' })
    @IsArray()
    @IsNotEmpty()
    codeValues: string[];
}
