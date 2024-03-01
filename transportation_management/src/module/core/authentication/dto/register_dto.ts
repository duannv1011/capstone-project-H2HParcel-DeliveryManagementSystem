import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString, Matches, MinLength } from 'class-validator';
import { AddresDto } from './adress_dto';
import { CustomerDto } from './customer_dto';

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

    @IsObject()
    @IsNotEmpty({ message: 'Null value error for address' })
    @ApiProperty({ example: AddresDto, description: 'address' })
    address: AddresDto;

    @IsObject()
    @IsNotEmpty({ message: 'Null value error for cumtomer' })
    @ApiProperty({ example: AddresDto, description: 'customer' })
    customer: CustomerDto;
}
