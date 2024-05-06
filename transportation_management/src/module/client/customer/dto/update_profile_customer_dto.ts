import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class updateCusProfileDto {
    @IsEmail()
    @ApiProperty({ example: 'example@gmail.com', description: 'The email' })
    @IsNotEmpty({ message: 'Null value error email' })
    email: string;

    @IsString()
    @ApiProperty({ example: 'fullname', description: 'The fullname' })
    @IsNotEmpty({ message: 'Null value error for fullname' })
    fullName: string;

    @IsString()
    @ApiProperty({ example: 'phone', description: 'The phone' })
    @IsNotEmpty({ message: 'Null value error phone' })
    @Matches(/^[0-9]+$/, { message: 'Invalid phone number format. Please enter only numeric characters.' })
    phone: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error: city' })
    addressId: number;

    @IsString()
    @ApiProperty({ example: 'hourse', description: 'The hourse' })
    @IsNotEmpty({ message: 'Null value error hourse' })
    house: string;

    @IsNumber()
    @ApiProperty({ example: '1', description: 'The city' })
    @IsNotEmpty({ message: 'Null value error: city' })
    cityId: number;

    @IsNumber()
    @ApiProperty({ example: '4', description: 'The district' })
    @IsNotEmpty({ message: 'Null value error: district' })
    districtId: number;

    @IsNumber()
    @ApiProperty({ example: '49', description: 'The ward' })
    @IsNotEmpty({ message: 'Null value error: ward' })
    wardId: number;
}
