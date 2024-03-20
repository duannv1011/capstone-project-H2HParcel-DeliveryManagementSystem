import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class sendEmailDto {
    @IsEmail()
    @ApiProperty({
        example: 'example@gmail.com',
    })
    @IsNotEmpty({ message: 'Null value error for email' })
    email: string;
}
