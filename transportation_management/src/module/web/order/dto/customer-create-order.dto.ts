import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CusCreateOrderDto {
    //@ApiProperty({ example: 11, description: 'cusId' })
    @IsString()
    @IsNotEmpty({ message: 'null value for cusId ' })
    cusId: number;

    @ApiProperty({ example: 10, description: 'pickup_infor_id' })
    @IsNumber()
    //@IsNotEmpty({ message: 'null value for pickup_infor_id ' })
    pickupInforId: number;

    // @ApiProperty({ example: 'Duan Nguyen', description: 'pickup_name' })
    // @IsString()
    // @IsNotEmpty({ message: 'null value for pickup_name ' })
    // pickupName: string;

    // @ApiProperty({ example: '0209151875', description: 'pickup_phone' })
    // @IsString()
    // @Matches(/^[0-9]+$/, { message: 'Invalid phone number format. Please enter only numeric characters.' })
    // @IsNotEmpty({ message: 'null value for pickup_phone ' })
    // pickupPhone: string;

    // @IsString()
    // @IsNotEmpty({ message: 'Null value error for pickup_house' })
    // @ApiProperty({ example: 'so nha 1 ngo X duong y', description: 'pickup_house' })
    // pickupHouse: string;

    // @IsNumber()
    // @IsNotEmpty({ message: 'Null value error for pickup_city_id' })
    // @ApiProperty({ example: '1', description: 'pickup_city_id' })
    // pickupCityId: number;

    // @IsNumber()
    // @IsNotEmpty({ message: 'Null value error for pickup_district_id' })
    // @ApiProperty({ example: '1', description: 'pickup_district_id' })
    // pickupDistrictId: number;

    // @IsNumber()
    // @IsNotEmpty({ message: 'Null value error for pickup_ward_id' })
    // @ApiProperty({ example: '1', description: 'pickup_ward_id' })
    // pickupWardId: number;

    @ApiProperty({ example: 10, description: 'deliver_infor_id' })
    @IsString()
    //@IsNotEmpty({ message: 'null value for deliver_infor_id ' })
    deliver_infor_id: number;

    // @ApiProperty({ example: 'Long ', description: 'deliver_name' })
    // @IsString()
    // @IsNotEmpty({ message: 'null value for deliver_name ' })
    // deliverNme: string;

    // @ApiProperty({ example: '0209151875', description: 'deliver_phone' })
    // @IsString()
    // @Matches(/^[0-9]+$/, { message: 'Invalid phone number format. Please enter only numeric characters.' })
    // @IsNotEmpty({ message: 'null value for deliver_phone ' })
    // deliverPhone: string;

    // @IsString()
    // @IsNotEmpty({ message: 'Null value error for deliver_house' })
    // @ApiProperty({ example: 'so nha 1 ngo X duong y', description: 'deliver_house' })
    // deliverHouse: string;

    // @IsNumber()
    // @IsNotEmpty({ message: 'Null value error for deliver_city_id' })
    // @ApiProperty({ example: '1', description: 'deliver_city_id' })
    // deliverCityId: number;

    // @IsNumber()
    // @IsNotEmpty({ message: 'Null value error for deliver_district_id' })
    // @ApiProperty({ example: '1', description: 'deliver_district_id' })
    // deliverDistrictId: number;

    // @IsNumber()
    // @IsNotEmpty({ message: 'Null value error for deliver_ward_id' })
    // @ApiProperty({ example: '1', description: 'deliver_ward_id' })
    // deliverWardId: number;

    // @ApiProperty({ example: 1, description: 'order_stt', default: 1 })
    // @IsString()
    // @IsNotEmpty({ message: 'null value for order_stt ' })
    // orderStt: number;

    @ApiProperty({ example: 1, description: 'pk_id' })
    @IsString()
    @IsNotEmpty({ message: 'null value for pk_id ' })
    pkId: number;

    @ApiProperty({ example: 1, description: 'paymentMethod' })
    @IsNumber()
    @IsNotEmpty({ message: 'null value for paymentMethod ' })
    paymentMethod: number;

    @ApiProperty({ example: 10, description: 'estimated_price' })
    @IsString()
    @IsNotEmpty({ message: 'null value for estimated_price ' })
    estimatedPrice: number;

    @ApiProperty({ example: null, description: 'payment' })
    @IsNumber()
    @IsNotEmpty({ message: 'null value for payment' })
    payment: string;
}
