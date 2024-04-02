import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Matches } from 'class-validator';

export class CustomerEditOrder {
    @ApiProperty({ example: 100, description: 'the order_id of order' })
    @IsNumber()
    @IsNotEmpty({ message: 'null value for order_id ' })
    order_id: number;
    // @ApiProperty({ example: 10, description: 'pickup_infor_id is set = 0 if not a default' })
    // @IsNumber()
    // //@IsNotEmpty({ message: 'null value for pickup_infor_id ' })
    // pickup_infor_id: number;
    // @ApiProperty({ example: 'Duan Nguyen', description: 'pickup_name' })
    // @IsString()
    // @IsNotEmpty({ message: 'null value for pickup_name ' })
    // pickup_name: string;

    // @ApiProperty({ example: '0209151875', description: 'pickup_phone' })
    // @IsString()
    // @Matches(/^[0-9]+$/, { message: 'Invalid phone number format. Please enter only numeric characters.' })
    // @IsNotEmpty({ message: 'null value for pickup_phone ' })
    // pickup_phone: string;

    // @IsString()
    // @IsNotEmpty({ message: 'Null value error for pickup_house' })
    // @ApiProperty({ example: 'so nha 1 ngo X duong y', description: 'pickup_house' })
    // pickup_house: string;

    // @IsNumber()
    // @IsNotEmpty({ message: 'Null value error for pickup_city_id' })
    // @ApiProperty({ example: '1', description: 'pickup_city_id' })
    // pickup_city_id: number;

    // @IsNumber()
    // @IsNotEmpty({ message: 'Null value error for pickup_district_id' })
    // @ApiProperty({ example: '1', description: 'pickup_district_id' })
    // pickup_district_id: number;

    // @IsNumber()
    // @IsNotEmpty({ message: 'Null value error for pickup_ward_id' })
    // @ApiProperty({ example: '1', description: 'pickup_ward_id' })
    // pickup_ward_id: number;

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
    @IsString()
    @IsNotEmpty({ message: 'Null value error for note' })
    @ApiProperty({ example: 'the stuff is easy to break', description: 'note' })
    note: string;
}
