import { Controller, Get, Query } from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('address')
@ApiTags('addres-api')
export class AddressController {
    constructor(private addressService: AddressService) {}
    @Get('getAllCity')
    @ApiOperation({ summary: 'get all city' })
    @ApiResponse({ status: 200, description: 'get all city  successfully.' })
    async getAllCity(): Promise<any> {
        return await this.addressService.getAllCity();
    }
    @Get('getCityById')
    @ApiOperation({ summary: 'get City By cityId' })
    @ApiResponse({ status: 200, description: 'getCityById  successfully.' })
    async getCityById(@Query('cit_id') city_id: number): Promise<any> {
        return await this.addressService.getCityById(city_id);
    }
    @Get('getAllDistrict')
    @ApiOperation({ summary: 'get all city' })
    @ApiResponse({ status: 200, description: 'get city  successfully.' })
    async getAllDistrict(): Promise<any> {
        return await this.addressService.getAllDistrict();
    }
    @Get('getDistrictById')
    @ApiOperation({ summary: 'get district By district_id' })
    @ApiResponse({ status: 200, description: 'get district  successfully.' })
    async getDistrictById(@Query('district_id') district_id: number): Promise<any> {
        return await this.addressService.getDistricById(district_id);
    }
    @Get('getDistrictByCityId')
    @ApiOperation({ summary: 'get district By city_id' })
    @ApiResponse({ status: 200, description: 'get district  successfully.' })
    async getDistrictByCityId(@Query('city_id') city_id: number): Promise<any> {
        return await this.addressService.getDistrictByCityId(city_id);
    }
    @Get('getAllWard')
    @ApiOperation({ summary: 'get all city' })
    @ApiResponse({ status: 200, description: 'get all city  successfully.' })
    async getAllWard(): Promise<any> {
        return await this.addressService.getAllWard();
    }
    @Get('getWardById')
    @ApiOperation({ summary: 'get Ward By ward_id' })
    @ApiResponse({ status: 200, description: 'get ward  successfully.' })
    async getWardById(@Query('ward_id') ward_id: number): Promise<any> {
        return await this.addressService.getDistricById(ward_id);
    }
    @Get('getWardByDitrictId')
    @ApiOperation({ summary: 'get Ward By distric_id' })
    @ApiResponse({ status: 200, description: 'get ward  successfully.' })
    async getWardByDitrictId(@Query('district_id') district_id: number): Promise<any> {
        return await this.addressService.getWardByDitrictId(district_id);
    }
}
