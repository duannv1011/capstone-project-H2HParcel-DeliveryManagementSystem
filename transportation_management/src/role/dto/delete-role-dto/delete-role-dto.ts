import { IsNotEmpty, IsNumberString } from 'class-validator';
export class DeleteRoleDto {
    @IsNumberString()
    @IsNotEmpty({ message: 'Null value error' })
    role_id: number;
}
