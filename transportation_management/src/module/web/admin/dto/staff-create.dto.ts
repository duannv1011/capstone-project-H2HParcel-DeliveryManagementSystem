import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, Matches, IsNotEmpty, MinLength } from 'class-validator';

export class CreateStaffDto {
    @IsString()
    @IsNotEmpty({ message: 'Null value error for username' })
    @ApiProperty({ example: 'username', description: 'username' })
    username: string;

    @IsString()
    @IsNotEmpty({ message: 'Null value error for password' })
    @ApiProperty({ example: 'Abcd@123', description: 'password' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/, {
        message: 'Invalid password format exp:Abcd@123',
    })
    password: string;
    @IsString()
    @IsNotEmpty({ message: 'null value for staff role' })
    @ApiProperty({ example: '3', description: 'roleId of Staff Account' })
    roleId: number;

    @ApiProperty({ example: 'teststaffName', description: 'fullname of Staff' })
    @IsNotEmpty({ message: 'null value for staff name' })
    @IsString()
    fullName: string;

    @ApiProperty({ example: 'testStaffEmail@gmail.com', description: 'email of Staff' })
    @IsEmail()
    email: string;

    @IsString()
    @Matches(/^[0-9]+$/, { message: 'Invalid phone number format. Please enter only numeric characters.' })
    @ApiProperty({ example: '096143152', description: 'phone number of Staff' })
    phone: string;

    @IsString()
    @IsNotEmpty({ message: 'null value for staff warehouse' })
    @ApiProperty({ example: '1', description: 'warehouseId of Staff' })
    warehouseId: number;
}
