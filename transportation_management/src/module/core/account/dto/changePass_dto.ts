import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, Matches, IsString } from 'class-validator';

export class changePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Null value error for password' })
    // @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @ApiProperty({ example: 'Qwer@123', description: 'The password' })
    // @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/, {
    //     message: 'Invalid password format exp:Abcd@123',
    // })
    oldpassword: string;
    @IsString()
    @IsNotEmpty({ message: 'Null value error for password' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @ApiProperty({ example: 'password', description: 'The password' })
    @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/, {
        message: 'Invalid password format exp:Abcd@123',
    })
    newpassword: string;
}
