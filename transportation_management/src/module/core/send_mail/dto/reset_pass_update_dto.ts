import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail()
    @ApiProperty({
        example: 'example@gmail.com',
    })
    @IsNotEmpty({ message: 'Null value error for email' })
    email: string;
    @IsString()
    @IsNotEmpty({ message: 'Null value error for password' })
    @ApiProperty({ example: 'Abcd@123', description: 'password' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/, {
        message: 'Invalid password format exp:Abcd@123',
    })
    password: string;
}
