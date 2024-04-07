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
            .orderBy('o.orderId', 'DESC')
            .getManyAndCount();
        const response = orders.map((o) => ({
            orderId: o.orderId,
            status: o.status.sttName,
            senderName: o.pickupInformation.name,
            pickupPhoneNumber: o.pickupInformation.phone,
            pickupAddress: `${o.pickupInformation.address.house}-${o.pickupInformation.address.ward.wardName}-${o.pickupInformation.address.district.districtName}-${o.pickupInformation.address.city.cityName}`,
            pickupStaffName: o.pickupShipperStaff ? o.pickupShipperStaff.fullname : '',
            receiverName: o.deliverInformation.name,
            deliverPhoneNumber: o.deliverInformation.phone,
            deliverAddress: `${o.deliverInformation.address.house}-${o.deliverInformation.address.ward.wardName}-${o.deliverInformation.address.district.districtName}-${o.deliverInformation.address.city.cityName}`,
            deliverStaffName: o.deliverShipperStaff ? o.deliverShipperStaff.fullname : '',
            pickUpdateWarehouseId: o.pickupInformation.address.ward.warehouseId,
            deliverUpdateWarehouseId: o.deliverInformation.address.ward.warehouseId,
            packageTypeId: o.packageType.pkId,
            packageTypeName: o.packageType.pkName,
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
                  statusId: dataQuery.status.statusId,
                  status: dataQuery.status.sttName,
                  senderName: dataQuery.pickupInformation.name,
                  pickupPhoneNumber: dataQuery.pickupInformation.phone,
                  pickupAddress: `${dataQuery.pickupInformation.address.house}-${dataQuery.pickupInformation.address.ward.wardName}-${dataQuery.pickupInformation.address.district.districtName}-${dataQuery.pickupInformation.address.city.cityName}`,
                  pickupStaffName: dataQuery.pickupShipperStaff ? dataQuery.pickupShipperStaff.fullname : '',
                  receiverName: dataQuery.deliverInformation.name,
                  deliverPhoneNumber: dataQuery.deliverInformation.phone,
                  deliverAddress: `${dataQuery.deliverInformation.address.house}-${dataQuery.deliverInformation.address.ward.wardName}-${dataQuery.deliverInformation.address.district.districtName}-${dataQuery.deliverInformation.address.city.cityName}`,
                  deliverStaffName: dataQuery.deliverShipperStaff ? dataQuery.deliverShipperStaff.fullname : '',
                  pickUpdateWarehouseId: dataQuery.pickupInformation.address.ward.warehouseId,
                  deliverUpdateWarehouseId: dataQuery.deliverInformation.address.ward.warehouseId,
                  packageTypeId: dataQuery.packageType.pkId,
                  packageTypeName: dataQuery.packageType.pkName,
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
