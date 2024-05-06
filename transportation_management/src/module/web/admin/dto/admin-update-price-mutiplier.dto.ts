import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsNumberString } from 'class-validator';

export class UpdatePriceAndMutiplier {
    //PackageType

    @ApiProperty({ example: 25000, description: 'paperPrice' })
    @IsNumberString()
    @IsNotEmpty({ message: 'missing data for paperPrice' })
    paperPrice: string;
    @ApiProperty({ example: 30000, description: 'smallParcelprice' })
    @IsNumberString()
    @IsNotEmpty({ message: 'missing data for smallParcelprice' })
    smallParcelprice: string;
    @ApiProperty({ example: 50000, description: 'mediumParcelPrice' })
    @IsNumberString()
    @IsNotEmpty({ message: 'missing data for mediumParcelPrice' })
    mediumParcelPrice: string;
    //PriceMutiplier
    @ApiProperty({ example: 1, description: 'mutiplier1' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for mutiplier1' })
    mutiplier1: number;
    @ApiProperty({ example: 1.5, description: 'mutiplier2' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for mutiplier2' })
    mutiplier2: number;
    @ApiProperty({ example: 3, description: 'mutiplier3' })
    @IsNumber()
    @IsNotEmpty({ message: 'missing data for mutiplier3' })
    mutiplier3: number;
}
