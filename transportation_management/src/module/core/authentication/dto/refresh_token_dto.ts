import { IsEmpty, IsString } from 'class-validator';

export class refreshTokenDto {
    @IsEmpty({ message: 'error input or null value' })
    @IsString({ message: 'must be a string' })
    refresh_token: string;
}
