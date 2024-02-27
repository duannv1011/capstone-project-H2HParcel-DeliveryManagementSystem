import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class DetailCustommerDto {
    @ApiProperty({ example: '123', description: 'The ID' })
    @IsNumberString()
    @IsNotEmpty({ message: 'Null value error' })
    id: string;

    @ApiProperty({ example: '123', description: 'The Role_ID' })
    @IsNumberString()
    @IsNotEmpty({ message: 'Null value error' })
    role_id: string;
}
