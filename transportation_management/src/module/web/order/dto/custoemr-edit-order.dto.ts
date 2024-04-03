import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Matches } from 'class-validator';

export class CustomerEditOrder {
    @ApiProperty({ example: 100, description: 'the orderId of order' })
    @IsNumber()
    @IsNotEmpty({ message: 'null value for orderId ' })
    orderId: number;
    // @ApiProperty({ example: 10, description: 'pickupInforId is set = 0 if not a default' })
    // @IsNumber()
    // //@IsNotEmpty({ message: 'null value for pickupInforId ' })
    // pickupInforId: number;
    // @ApiProperty({ example: 'Duan Nguyen', description: 'pickupName' })
    // @IsString()
    // @IsNotEmpty({ message: 'null value for pickupName ' })
    // pickupName: string;

    // @ApiProperty({ example: '0209151875', description: 'pickupPhone' })
    // @IsString()
    // @Matches(/^[0-9]+$/, { message: 'Invalid phone number format. Please enter only numeric characters.' })
    // @IsNotEmpty({ message: 'null value for pickupPhone ' })
    // pickupPhone: string;

    // @IsString()
    // @IsNotEmpty({ message: 'Null value error for pickupHouse' })
    // @ApiProperty({ example: 'so nha 1 ngo X duong y', description: 'pickupHouse' })
    // pickupHouse: string;

    // @IsNumber()
    // @IsNotEmpty({ message: 'Null value error for pickupCityId' })
    // @ApiProperty({ example: '1', description: 'pickupCityId' })
    // pickupCityId: number;

    // @IsNumber()
    // @IsNotEmpty({ message: 'Null value error for pickupDistrictId' })
    // @ApiProperty({ example: '1', description: 'pickupDistrictId' })
    // pickupDistrictId: number;

    // @IsNumber()
    // @IsNotEmpty({ message: 'Null value error for pickupWardId' })
    // @ApiProperty({ example: '1', description: 'pickupWardId' })
    // pickupWardId: number;

    @ApiProperty({ example: 'Long ', description: 'deliverName' })
    @IsString()
    @IsNotEmpty({ message: 'null value for deliverName ' })
    deliverName: string;

    @ApiProperty({ example: '0209151875', description: 'deliverPhone' })
    @IsString()
    @Matches(/^[0-9]+$/, { message: 'Invalid phone number format. Please enter only numeric characters.' })
    @IsNotEmpty({ message: 'null value for deliverPhone ' })
    deliverPhone: string;

    @IsString()
    @IsNotEmpty({ message: 'Null value error for deliverHouse' })
    @ApiProperty({ example: 'so nha 1 ngo X duong y', description: 'deliverHouse' })
    deliverHouse: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for deliverCityId' })
    @ApiProperty({ example: '1', description: 'deliverCityId' })
    deliverCityId: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for deliverDistrictId' })
    @ApiProperty({ example: '1', description: 'deliverDistrictId' })
    deliverDistrictId: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for deliverWardId' })
    @ApiProperty({ example: '1', description: 'deliverWardId' })
    deliverWardId: number;
    @IsString()
    @IsNotEmpty({ message: 'Null value error for note' })
    @ApiProperty({ example: 'the stuff is easy to break', description: 'note' })
    note: string;
}
