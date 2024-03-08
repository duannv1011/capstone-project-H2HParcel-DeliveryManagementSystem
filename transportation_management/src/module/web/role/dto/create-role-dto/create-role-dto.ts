import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateRoleDto {
    @IsString()
    @IsNotEmpty({ message: 'Null value error' })
    @ApiProperty({ example: 'xyz', description: 'role_name' })
    role_name: string;
}
