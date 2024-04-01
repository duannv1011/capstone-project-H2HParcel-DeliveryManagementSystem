import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CityEntity } from 'src/entities/city.entity';
import { DistrictEntity } from 'src/entities/district.entity';
import { WardEntity } from 'src/entities/ward.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AddressService {
    constructor(
        @InjectRepository(CityEntity)
        private cityRepository: Repository<CityEntity>,
        @InjectRepository(DistrictEntity)
        private districtRepository: Repository<DistrictEntity>,
        @InjectRepository(WardEntity)
        private wardRepository: Repository<WardEntity>,
    ) {}
    async getAllCity() {
        return await this.cityRepository.find();
    }
    async getCityById(city_id: number): Promise<CityEntity> {
        return await this.cityRepository.findOne({ where: { city_id: city_id } });
    }
    async getAllDistrict() {
        return await this.districtRepository.createQueryBuilder('d').leftJoinAndSelect('d.city', 'c').getMany();
    }
    async getDistricById(district_id: number): Promise<DistrictEntity> {
        return await this.districtRepository.findOne({ where: { district_id: district_id } });
    }
    async getAllWard() {
        return await this.wardRepository.find();
    }
    async getWardById(ward_id: number): Promise<WardEntity> {
        return await this.wardRepository.findOne({ where: { ward_id: ward_id } });
    }
}
