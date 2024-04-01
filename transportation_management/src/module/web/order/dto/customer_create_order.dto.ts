import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CusCreateOrderDto {
    //@ApiProperty({ example: 11, description: 'cus_id' })
    @IsString()
    @IsNotEmpty({ message: 'null value for cus_id ' })
    cus_id: number;

    @ApiProperty({ example: 10, description: 'pickup_infor_id' })
    @IsNumber()
    //@IsNotEmpty({ message: 'null value for pickup_infor_id ' })
    pickup_infor_id: number;

    @ApiProperty({ example: 'Duan Nguyen', description: 'pickup_name' })
    @IsString()
    @IsNotEmpty({ message: 'null value for pickup_name ' })
    pickup_name: string;

    @ApiProperty({ example: '0209151875', description: 'pickup_phone' })
    @IsString()
    @Matches(/^[0-9]+$/, { message: 'Invalid phone number format. Please enter only numeric characters.' })
    @IsNotEmpty({ message: 'null value for pickup_phone ' })
    pickup_phone: string;

    @IsString()
    @IsNotEmpty({ message: 'Null value error for pickup_house' })
    @ApiProperty({ example: 'so nha 1 ngo X duong y', description: 'pickup_house' })
    pickup_house: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for pickup_city_id' })
    @ApiProperty({ example: '1', description: 'pickup_city_id' })
    pickup_city_id: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for pickup_district_id' })
    @ApiProperty({ example: '1', description: 'pickup_district_id' })
    pickup_district_id: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for pickup_ward_id' })
    @ApiProperty({ example: '1', description: 'pickup_ward_id' })
    pickup_ward_id: number;

    // @ApiProperty({ example: 10, description: 'deliver_infor_id' })
    // @IsString()
    // @IsNotEmpty({ message: 'null value for deliver_infor_id ' })
    // deliver_infor_id: number;

    @ApiProperty({ example: 'Long ', description: 'deliver_name' })
    @IsString()
    @IsNotEmpty({ message: 'null value for deliver_name ' })
    deliver_name: string;

    @ApiProperty({ example: '0209151875', description: 'deliver_phone' })
    @IsString()
    @Matches(/^[0-9]+$/, { message: 'Invalid phone number format. Please enter only numeric characters.' })
    @IsNotEmpty({ message: 'null value for deliver_phone ' })
    deliver_phone: string;

    @IsString()
    @IsNotEmpty({ message: 'Null value error for deliver_house' })
    @ApiProperty({ example: 'so nha 1 ngo X duong y', description: 'deliver_house' })
    deliver_house: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for deliver_city_id' })
    @ApiProperty({ example: '1', description: 'deliver_city_id' })
    deliver_city_id: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for deliver_district_id' })
    @ApiProperty({ example: '1', description: 'deliver_district_id' })
    deliver_district_id: number;

    @IsNumber()
    @IsNotEmpty({ message: 'Null value error for deliver_ward_id' })
    @ApiProperty({ example: '1', description: 'deliver_ward_id' })
    deliver_ward_id: number;

    @ApiProperty({ example: 1, description: 'order_stt', default: 1 })
    @IsString()
    @IsNotEmpty({ message: 'null value for order_stt ' })
    order_stt: number;

    @ApiProperty({ example: 1, description: 'pk_id' })
    @IsString()
    @IsNotEmpty({ message: 'null value for pk_id ' })
    pk_id: number;

    @ApiProperty({ example: 10, description: 'estimated_price' })
    @IsString()
    @IsNotEmpty({ message: 'null value for estimated_price ' })
    estimated_price: number;
}
