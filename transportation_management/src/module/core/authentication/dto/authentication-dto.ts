import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class loginDto {
    @IsString()
    @IsNotEmpty({ message: 'Null value error' })
    @ApiProperty({ example: 'duannv', description: 'username' })
    username: string;

    @IsString()
    @IsNotEmpty({ message: 'Null value error' })
    @ApiProperty({ example: 'Abcd@123', description: 'password' })
    password: string;
}
