import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsEmail, IsNumber } from 'class-validator';

export class CustomerDto {
    @IsString()
    @IsNotEmpty({ message: 'Null value error for Fullname' })
    @ApiProperty({ example: 'NGUYEN VAN D', description: 'fullName' })
    fullName: string;

    @IsString()
    @IsNotEmpty({ message: 'Null value error for Phone' })
    @Matches(/^[0-9]+$/, { message: 'Invalid phone number format. Please enter only numeric characters.' })
    @ApiProperty({ example: '096143152', description: 'phone number' })
    phone: string;

    @IsEmail()
    @ApiProperty({ example: 'example@abc.xyz', description: 'email' })
    email: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for address_id' })
    addressId: number;

    @IsNumber()
    status: number = 1;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for account_id' })
    accId: number;
}
