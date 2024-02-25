import { IsNotEmpty, IsString } from 'class-validator';
export class CreateRoleDto {
    @IsString()
    @IsNotEmpty({ message: 'Null value error' })
    role_name: string;
}
