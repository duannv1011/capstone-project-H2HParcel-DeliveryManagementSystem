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
    async getCityById(cityId: number): Promise<CityEntity> {
        return await this.cityRepository.findOne({ where: { cityId: cityId } });
    }
    async getAllDistrict() {
        return await this.districtRepository.createQueryBuilder('d').leftJoinAndSelect('d.city', 'c').getMany();
    }
    async getDistricById(districtId: number): Promise<DistrictEntity> {
        return await this.districtRepository.findOne({ where: { districtId: districtId } });
    }
    async getDistrictByCityId(cityId: number): Promise<DistrictEntity[]> {
        return await this.districtRepository.find({ where: { cityId: cityId } });
    }
    async getAllWard() {
        return await this.wardRepository.find();
    }
    async getWardById(wardId: number): Promise<WardEntity> {
        return await this.wardRepository.findOne({ where: { wardId: wardId } });
    }
    async getWardByDitrictId(districtId: number): Promise<WardEntity[]> {
        return await this.wardRepository.find({
            where: {
                district: {
                    districtId: districtId,
                },
            },
        });
    }
}
