import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from 'src/entities/address.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';
import { Paging } from 'src/module/response/Paging';
import { Brackets, DataSource, Repository } from 'typeorm';

@Injectable()
export class ShipperService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(CustomerEntity)
        private customerEntity: Repository<CustomerEntity>,
        @InjectRepository(StaffEntity)
        private staffEntity: Repository<StaffEntity>,
        @InjectRepository(WarehouseEntity)
        private warehouseRepository: Repository<WarehouseEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        private dataSource: DataSource,
    ) {}
    async findAllOrder(pageNo: number, accId): Promise<any> {
        const pageSize = Number(process.env.PAGE_SIZE);
        const shipper = await this.staffEntity.findOneBy({ accId: accId });
        const shipperId = Number(shipper.staffId);
        const [orders, count] = await this.orderRepository
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.pickupInformation', 'pi')
            .leftJoinAndSelect('o.deliverInformation', 'di')
            .leftJoinAndSelect('o.pickupShipperStaff', 'ps')
            .leftJoinAndSelect('o.deliverShipperStaff', 'ds')
            .leftJoinAndSelect('o.status', 'os')
            .leftJoinAndSelect('o.packageType', 'op')
            .leftJoinAndSelect('pi.address', 'pa')
            .leftJoinAndSelect('pa.city', 'pc')
            .leftJoinAndSelect('pa.district', 'pdi')
            .leftJoinAndSelect('pa.ward', 'pw')
            .leftJoinAndSelect('di.address', 'da')
            .leftJoinAndSelect('da.city', 'dc')
            .leftJoinAndSelect('da.district', 'ddi')
            .leftJoinAndSelect('da.ward', 'dw')
            .andWhere(
                new Brackets((qb) => {
                    qb.where('o.pickupShipper = :shipperId', {
                        shipperId: shipperId,
                    }).orWhere('o.deliverShipper = :shipperId', { shipperId: shipperId });
                }),
            )
            .orderBy('o.orderId', 'ASC')
            .getManyAndCount();
        const response = orders.map((o) => ({
            orderId: o.orderId,
            pickName: o.pickupInformation.name,
            pickPhone: o.pickupInformation.phone,
            pickCity: o.pickupInformation.address.city.cityName,
            pickDistrict: o.pickupInformation.address.district.districtName,
            pickWard: o.pickupInformation.address.ward.wardName,
            pickShiper: o.pickupShipperStaff ? o.pickupShipperStaff.fullname : '',
            deliverName: o.deliverInformation.name,
            deliverPhone: o.deliverInformation.phone,
            deliverCity: o.deliverInformation.address.city.cityName,
            deliverDistrict: o.deliverInformation.address.district.districtName,
            deliverWard: o.deliverInformation.address.ward.wardName,
            deliverShiper: o.deliverShipperStaff ? o.deliverShipperStaff.fullname : '',
            status: o.status.sttName,
            pakeType: o.packageType.pkName,
            price: o.estimatedPrice,
        }));

        const paging = new Paging(pageNo, pageSize, count);
        return { response, paging };
    }
    async getDetailOrder(orderId: number): Promise<any> {
        const dataQuery = await this.orderRepository
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.pickupInformation', 'pi')
            .leftJoinAndSelect('o.deliverInformation', 'di')
            .leftJoinAndSelect('o.pickupShipperStaff', 'ps')
            .leftJoinAndSelect('o.deliverShipperStaff', 'ds')
            .leftJoinAndSelect('o.status', 'os')
            .leftJoinAndSelect('o.packageType', 'op')
            .leftJoinAndSelect('pi.address', 'pa')
            .leftJoinAndSelect('pa.city', 'pc')
            .leftJoinAndSelect('pa.district', 'pdi')
            .leftJoinAndSelect('pa.ward', 'pw')
            .leftJoinAndSelect('di.address', 'da')
            .leftJoinAndSelect('da.city', 'dc')
            .leftJoinAndSelect('da.district', 'ddi')
            .leftJoinAndSelect('da.ward', 'dw')
            .where('o.order_id = :orderId', { orderId: orderId })
            .getOne()
            .catch((error) => {
                return error;
            });
        console.log(dataQuery);
        const order = dataQuery
            ? {
                  orderId: dataQuery.orderId,
                  pickName: dataQuery.pickupInformation.name,
                  pickPhone: dataQuery.pickupInformation.phone,
                  pickCity: dataQuery.pickupInformation.address.city.cityName,
                  pickDistrict: dataQuery.pickupInformation.address.district.districtName,
                  pickWard: dataQuery.pickupInformation.address.ward.wardName,
                  pickShiper: dataQuery.pickupShipperStaff ? dataQuery.pickupShipperStaff.fullname : null,
                  deliverName: dataQuery.deliverInformation.name,
                  deliverPhone: dataQuery.deliverInformation.phone,
                  deliverCity: dataQuery.deliverInformation.address.city.cityName,
                  deliverDistrict: dataQuery.deliverInformation.address.district.districtName,
                  deliverWard: dataQuery.deliverInformation.address.ward.wardName,
                  deliverShiper: dataQuery.deliverShipperStaff ? dataQuery.deliverShipper.fullname : null,
                  status: dataQuery.status.sttName,
                  pakeType: dataQuery.packageType.pkName,
                  price: dataQuery.estimatedPrice,
              }
            : null;
        return order ? order : 'query error or not found';
    }
    async getshipperToAsign(accId: number) {
        const staff = await this.staffEntity.findOneBy({ accId: accId });
        const shippers = await this.staffEntity
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.account', 'a')
            .leftJoinAndSelect('a.role', 'r')
            .where('s.warehouse_id =:warehouseId', { warehouseId: staff.warehouseId })
            .andWhere('r.role_id =:roleId', { roleId: 2 })
            .getMany();
        const response = shippers.map((s) => ({
            staffId: s.staffId,
            fullname: s.fullname,
        }));
        return shippers ? response : 'not found!';
    }
}
