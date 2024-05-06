import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ScanQrDto {
    @ApiProperty({ example: 'aaipfguq[ohiq[ghqa[gqhgqo', description: 'code value of Order' })
    @IsString()
    @IsNotEmpty({ message: 'null value for qrCode' })
    qrCode: string;
}
