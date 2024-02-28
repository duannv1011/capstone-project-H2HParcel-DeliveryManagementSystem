import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsString } from 'class-validator';

export class refreshTokenDto {
    @IsEmpty({ message: 'error input or null value' })
    @IsString({ message: 'must be a string' })
    @ApiProperty({ example: 'abcxyz', description: 'The token String' })
    refresh_token: string;
}
