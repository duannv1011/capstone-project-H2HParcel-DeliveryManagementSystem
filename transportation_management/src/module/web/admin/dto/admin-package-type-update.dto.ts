import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdatePakageType {
    @ApiProperty({ example: '1', description: 'status of pkId' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for status' })
    pkId: number;
    @ApiProperty({ example: 'Paper', description: 'id of Customer' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for pkName' })
    pkName: string;
    @ApiProperty({ example: '10000', description: 'id of Customer' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for pkPrice' })
    pkPrice: string;
}
