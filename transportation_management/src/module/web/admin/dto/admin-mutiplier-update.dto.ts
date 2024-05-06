import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateMutiplier {
    @ApiProperty({ example: '1', description: 'status of pkId' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for status' })
    id: number;
    @ApiProperty({ example: 'Paper', description: 'id of Customer' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for pkName' })
    minDistance: number;
    @ApiProperty({ example: '10000', description: 'id of Mutiplier' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for maxDistance' })
    maxDistance: number;
    @ApiProperty({ example: 1.5, description: 'id of Mutiplier' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for mutiplier' })
    mutiplier: number;
}
