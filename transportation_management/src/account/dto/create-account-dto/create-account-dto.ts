import { IsBoolean, IsNotEmpty, IsNumberString, IsString, Matches } from 'class-validator';

export class CreateAccountDto {
    @IsString()
    @IsNotEmpty({ message: 'Null value error' })
    username: string;

    @IsString()
    @IsNotEmpty({ message: 'Null value error' })
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()-_+=])[0-9a-zA-Z!@#$%^&*()-_+=]{8,}$/, {
        message: 'Invalid password format',
    })
    password: string;

    @IsNumberString()
    @IsNotEmpty({ message: 'Null value error' })
    role_id: number;

    @IsBoolean()
    @IsNotEmpty({ message: 'Null value error' })
    isActive: boolean;
}
