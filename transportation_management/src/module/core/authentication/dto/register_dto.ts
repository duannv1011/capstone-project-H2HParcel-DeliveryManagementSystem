import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty({ message: 'Null value error for username' })
    @ApiProperty({ example: 'duannv', description: 'username' })
    username: string;

    @IsString()
    @IsNotEmpty({ message: 'Null value error for password' })
    @ApiProperty({ example: 'Abcd@123', description: 'password' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/, {
        message: 'Invalid password format exp:Abcd@123',
    })
    password: string;
}
