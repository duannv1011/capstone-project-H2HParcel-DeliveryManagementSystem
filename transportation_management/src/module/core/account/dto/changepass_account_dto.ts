import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { UpdateDateColumn } from 'typeorm';

export class ChangePasswordAccountdto {
    @IsString()
    @IsNotEmpty({ message: 'Old password is required' })
    oldpassword: string;

    @IsString()
    @IsNotEmpty({ message: 'password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/, {
        message: 'Invalid password format exp:Abcd@123',
    })
    password: string;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    date_update_at: Date;
}
