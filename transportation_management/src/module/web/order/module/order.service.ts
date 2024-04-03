import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/entities/customer.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { CusCreateOrderDto } from '../dto/customer_create_order.dto';
import { InformationEntity } from 'src/entities/Information.entity';
import { AddressEntity } from 'src/entities/address.entity';
import { CustomerEditOrder } from '../dto/custoemr-edit-order.dto';
import { RequestEntity } from 'src/entities/request.entity';
import { RequestRecordEntity } from 'src/entities/request-record.entity';
import { AddressBookEntity } from 'src/entities/addressBook.entity';
import { RequestStatusEntity } from 'src/entities/request-status.entity';
import { RequestTypeEntity } from 'src/entities/request-type.entity';
import { CustomerCancelOrder } from '../dto/customer-cancel-order.dto';
import { PackageTypeEntity } from 'src/entities/package-type.entity';
import { CaculataOrderPrice } from '../dto/caculate-order-price.dto';
import { WardEntity } from 'src/entities/ward.entity';
import { WarehouseRuleEntity } from 'src/entities/warehouse-rule.entity';
import { PriceMultiplierEntity } from 'src/entities/price-mutiplỉe.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(PriceMultiplierEntity)
        private priceMutiPlierRepository: Repository<PriceMultiplierEntity>,
        @InjectRepository(WardEntity)
        private wardRepository: Repository<WardEntity>,
        @InjectRepository(PackageTypeEntity)
        private packageTypeRepository: Repository<PackageTypeEntity>,
        @InjectRepository(AddressBookEntity)
        private addressbookRepository: Repository<AddressBookEntity>,
        @InjectRepository(RequestEntity)
        private requestRepository: Repository<RequestEntity>,
        @InjectRepository(WarehouseRuleEntity)
        private warehouseRuleRepository: Repository<WarehouseRuleEntity>,
        @InjectRepository(RequestStatusEntity)
        private requestStatusRepository: Repository<RequestStatusEntity>,
        @InjectRepository(RequestTypeEntity)
        private requestTypeRepository: Repository<RequestTypeEntity>,
        @InjectRepository(RequestRecordEntity)
        private requesRecodtRepository: Repository<RequestRecordEntity>,
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(InformationEntity)
        private informationRepository: Repository<InformationEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        private dataSource: DataSource,
    ) {}
    async getAllOrders(acc_id: number, pageNo: number): Promise<any> {
        const customer = await this.customerRepository.findOne({ where: { acc_id: acc_id } });
        const cus_id = customer ? customer.cus_id : 0;
        //const orders = await this.orderRepository.findOne({ where: { cusId: cus_id } });
        const pageSize = Number(process.env.PAGE_SIZE);
        const [list, count] = await this.orderRepository
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.pickup_information', 'pi')
            .leftJoinAndSelect('o.deliver_information', 'di')
            .leftJoinAndSelect('o.pickup_shipper_staff', 'ps')
            .leftJoinAndSelect('o.deliver_shipper_staff', 'ds')
            .leftJoinAndSelect('o.status', 'os')
            .leftJoinAndSelect('o.package_type', 'op')
            .leftJoinAndSelect('pi.address', 'pa')
            .leftJoinAndSelect('pa.city', 'pc')
            .leftJoinAndSelect('pa.district', 'pdi')
            .leftJoinAndSelect('pa.ward', 'pw')
            .leftJoinAndSelect('di.address', 'da')
            .leftJoinAndSelect('da.city', 'dc')
            .leftJoinAndSelect('da.district', 'ddi')
            .leftJoinAndSelect('da.ward', 'dw')
            .where('o.cus_id = :cus_id', { cus_id: cus_id })
            .skip((pageNo - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        const orders = list.map((item) => ({
            order_id: item.order_id,
            pick_name: item.pickup_information.name,
            pick_phone: item.pickup_information.phone,
            pick_city: item.pickup_information.address.city.city_name,
            pick_district: item.pickup_information.address.district.district_name,
            pick_ward: item.pickup_information.address.ward.ward_name,
            pick_shiper: item.pickup_shipper_staff ? item.pickup_shipper_staff.fullname : null,
            deliver_name: item.deliver_information.name,
            deliver_phone: item.deliver_information.phone,
            deliver_city: item.deliver_information.address.city.city_name,
            deliver_district: item.deliver_information.address.district.district_name,
            deliver_ward: item.deliver_information.address.ward.ward_name,
            deliver_shiper: item.deliver_shipper_staff ? item.deliver_shipper_staff.fullname : null,
            status: item.status.stt_name,
            pake_type: item.package_type.pk_name,
            price: item.estimated_price,
        }));
        const totalpage = Math.ceil(count % pageSize === 0 ? count / pageSize : Math.floor(count / pageSize) + 1);
        if (!count || totalpage < pageNo) {
            return { status: 404, msg: 'not found!' };
        }
        return {
            orders,
            count,
            pageNo,
            pageSize,
            totalpage,
        };
    }
    async getDetailOrder(order_id: number, acc_id: number): Promise<any> {
        const customer = await this.customerRepository.findOne({ where: { acc_id: acc_id } });
        const cus_id = customer ? customer.cus_id : 0;
        const dataQuery = await this.orderRepository
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.pickup_information', 'pi')
            .leftJoinAndSelect('o.deliver_information', 'di')
            .leftJoinAndSelect('o.pickup_shipper_staff', 'ps')
            .leftJoinAndSelect('o.deliver_shipper_staff', 'ds')
            .leftJoinAndSelect('o.status', 'os')
            .leftJoinAndSelect('o.package_type', 'op')
            .leftJoinAndSelect('pi.address', 'pa')
            .leftJoinAndSelect('pa.city', 'pc')
            .leftJoinAndSelect('pa.district', 'pdi')
            .leftJoinAndSelect('pa.ward', 'pw')
            .leftJoinAndSelect('di.address', 'da')
            .leftJoinAndSelect('da.city', 'dc')
            .leftJoinAndSelect('da.district', 'ddi')
            .leftJoinAndSelect('da.ward', 'dw')
            .where('o.cus_id = :cus_id', { cus_id: cus_id })
            .andWhere('o.order_id = :order_id', { order_id: order_id })
            .getOne()
            .catch((error) => {
                return error;
            });
        console.log(dataQuery);
        const order = dataQuery
            ? {
                  order_id: dataQuery.order_id,
                  pick_name: dataQuery.pickup_information.name,
                  pick_phone: dataQuery.pickup_information.phone,
                  pick_city: dataQuery.pickup_information.address.city.city_name,
                  pick_district: dataQuery.pickup_information.address.district.district_name,
                  pick_ward: dataQuery.pickup_information.address.ward.ward_name,
                  pick_shiper: dataQuery.pickup_shipper_staff ? dataQuery.pickup_shipper_staff.fullname : null,
                  deliver_name: dataQuery.deliver_information.name,
                  deliver_phone: dataQuery.deliver_information.phone,
                  deliver_city: dataQuery.deliver_information.address.city.city_name,
                  deliver_district: dataQuery.deliver_information.address.district.district_name,
                  deliver_ward: dataQuery.deliver_information.address.ward.ward_name,
                  deliver_shiper: dataQuery.deliver_shipper_staff ? dataQuery.deliver_shipper.fullname : null,
                  status: dataQuery.status.stt_name,
                  pake_type: dataQuery.package_type.pk_name,
                  price: dataQuery.estimated_price,
              }
            : null;
        return order ? order : 'query error or not found';
    }
    async createOrder(data: CusCreateOrderDto, acc_id: number): Promise<any> {
        const customer = await this.customerRepository.findOne({ where: { acc_id: acc_id } });
        const cus_id = customer ? customer.cus_id : 0;
        data.cus_id = cus_id;
        const checkPickupInfor = await this.addressbookRepository.findOne({
            where: { cus_id: cus_id, infor_id: data.pickup_infor_id ? data.pickup_infor_id : 0 },
        });
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // create or set exisited pickupinforid to be use
            let puinforid;
            if (!checkPickupInfor) {
                // create adress
                const address1 = new AddressEntity();
                address1.address_id = 0;
                address1.house = data.pickup_house;
                address1.city_id = data.pickup_city_id;
                address1.district_id = data.pickup_district_id;
                address1.ward_id = data.pickup_ward_id;
                const address1Insert = await queryRunner.manager.save(AddressEntity, address1);
                // create information
                const pickupIf = new InformationEntity();
                pickupIf.infor_id = 0;
                pickupIf.name = data.pickup_name;
                pickupIf.phone = data.pickup_phone;
                pickupIf.address = address1Insert;
                const pickupinforInsert = await queryRunner.manager.save(InformationEntity, pickupIf);
                puinforid = pickupinforInsert.infor_id;
            } else {
                puinforid = checkPickupInfor.infor_id;
            }
            // create new information (deliver information)
            // create adress
            const address2 = new AddressEntity();
            address2.address_id = 0;
            address2.house = data.pickup_house;
            address2.city_id = data.pickup_city_id;
            address2.district_id = data.pickup_district_id;
            address2.ward_id = data.pickup_ward_id;
            const address2Insert = await queryRunner.manager.save(AddressEntity, address2);
            // create information
            const deliverIf = new InformationEntity();
            deliverIf.infor_id = 0;
            deliverIf.name = data.pickup_name;
            deliverIf.phone = data.pickup_phone;
            deliverIf.address = address2Insert;
            const deliverinforInsert = await queryRunner.manager.save(InformationEntity, deliverIf);
            const dlvInfor_id = deliverinforInsert.infor_id;
            //create order
            const order = new OrderEntity();
            order.order_id = 0;
            order.cus_id = cus_id;
            order.pickup_infor_id = puinforid;
            order.pickup_shipper = null;
            order.deliver_infor_id = dlvInfor_id;
            order.deliver_shipper = null;
            order.order_stt = 1;
            order.pk_id = data.pk_id;
            order.estimated_price = data.estimated_price;
            await queryRunner.manager.save(OrderEntity, order);
            await queryRunner.commitTransaction();
            return 'create order successfully';
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
    async customeEditOrder(data: CustomerEditOrder, acc_id: number) {
        const customer = await this.customerRepository.findOne({ where: { acc_id: acc_id } });
        const cus_id = customer ? customer.cus_id : 0;
        const order = await this.orderRepository.findOne({ where: { order_id: data.order_id, cus_id: cus_id } });
        if (!order) {
            return 'order not found';
        }
        const o_stt = Number(order.status.stt_id);
        if (o_stt > 4 || o_stt < 1) {
            return { order_status: o_stt, error: 'canot update this order' };
        }
        const checkIsCancel = await this.requesRecodtRepository
            .createQueryBuilder('rc')
            .leftJoinAndSelect('rc.request', 'r')
            .leftJoinAndSelect('r.order', 'o')
            .leftJoinAndSelect('o.status', 's')
            .where('rc.request_type !=:request_type', { request_type: 1 })
            .andWhere('r.order_id =:order_id', { order_id: order.order_id })
            .getOne();
        if (checkIsCancel) {
            return 'this order is Cancel or delivered';
        }
        // const checkPickupInfor = await this.addressbookRepository.findOne({
        //     where: { cus_id: cus_id, infor_id: data.pickup_infor_id ? data.pickup_infor_id : 0 },
        // });
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // create or set exisited pickupinforid to be use
            // create or set exisited pickupinforid to be use
            //const puinforid = 0;

            // if (o_stt === 1) {
            //     if (!checkPickupInfor) {
            //         // create adress
            //         const address1 = new AddressEntity();
            //         address1.address_id = 0;
            //         address1.house = data.pickup_house;
            //         address1.city_id = data.pickup_city_id;
            //         address1.district_id = data.pickup_district_id;
            //         address1.ward_id = data.pickup_ward_id;
            //         const address1Insert = await queryRunner.manager.save(AddressEntity, address1);
            //         // create information
            //         const pickupIf = new InformationEntity();
            //         pickupIf.infor_id = 0;
            //         pickupIf.name = data.pickup_name;
            //         pickupIf.phone = data.pickup_phone;
            //         pickupIf.address = address1Insert;
            //         const pickupinforInsert = await queryRunner.manager.save(InformationEntity, pickupIf);
            //         puinforid = pickupinforInsert.infor_id;
            //         console.log('stt=1 , new pickup:' + puinforid);
            //     } else {
            //         puinforid = checkPickupInfor.infor_id;
            //         console.log('stt=1, old pickup' + puinforid);
            //     }
            // }
            // console.log(puinforid);

            // create new information (deliyver information)
            const checkRequestLigal = await this.requesRecodtRepository
                .createQueryBuilder('rc')
                .leftJoinAndSelect('rc.request', 'r')
                .leftJoinAndSelect('r.order', 'o')
                .leftJoinAndSelect('o.status', 's')
                .leftJoinAndSelect('r.deliverInformation', 'di')
                .leftJoinAndSelect('di.address', 'a')
                .where('rc.request_type =:request_type', { request_type: 1 })
                .where('rc.request_stt =:request_stt', { request_stt: 1 })
                .andWhere('r.order_id =:order_id', { order_id: order.order_id })
                .getOne();

            if (!checkRequestLigal) {
                //create deliver address
                const address2 = new AddressEntity();
                address2.address_id = 0;
                address2.house = data.deliver_house;
                address2.city_id = data.deliver_city_id;
                address2.district_id = data.deliver_district_id;
                address2.ward_id = data.deliver_ward_id;
                const address2Insert = await queryRunner.manager.save(AddressEntity, address2);
                // create deliver information
                const deliverIf = new InformationEntity();
                deliverIf.infor_id = 0;
                deliverIf.name = data.deliver_name;
                deliverIf.phone = data.deliver_phone;
                deliverIf.address = address2Insert;
                const deliverinforInsert = await queryRunner.manager.save(InformationEntity, deliverIf);
                const dlvInfor_id = deliverinforInsert.infor_id;
                //create  Request
                const request = new RequestEntity();
                request.requestId = 0;
                request.orderId = order.order_id;
                request.pickupInfor = order.pickup_infor_id;
                request.deliverInfor = dlvInfor_id;
                const requestInsertreult = await queryRunner.manager.save(RequestEntity, request);
                //create RequestRecord
                const requestRecord = new RequestRecordEntity();
                requestRecord.record_id = 0;
                requestRecord.refer_id = requestInsertreult.requestId;
                // const reqsetStautus = await this.requestStatusRepository.findOneBy({ rqs_name: 'Processing' });
                requestRecord.request_type = 1;
                requestRecord.request_stt = 1;
                requestRecord.note = data.note;
                await queryRunner.manager.save(RequestRecordEntity, requestRecord);
            } else {
                //update deliver address
                const address = await queryRunner.manager.findOneBy(AddressEntity, {
                    address_id: checkRequestLigal.request.deliverInformation.address.address_id,
                });
                address.house = data.deliver_house;
                address.city_id = data.deliver_city_id;
                address.district_id = data.deliver_district_id;
                address.ward_id = data.deliver_ward_id;
                console.log(address.house);
                await queryRunner.manager.save(AddressEntity, address);
                //update deliver information
                const deliverIf = await queryRunner.manager.findOneBy(InformationEntity, {
                    infor_id: checkRequestLigal.request.deliverInformation.infor_id,
                });
                deliverIf.name = data.deliver_name;
                deliverIf.phone = data.deliver_phone;
                await queryRunner.manager.save(InformationEntity, deliverIf);
                //update request record
                const requestRecord = await queryRunner.manager.findOneBy(RequestRecordEntity, {
                    refer_id: checkRequestLigal.request.requestId,
                });
                requestRecord.note = data.note;
                await queryRunner.manager.save(RequestRecordEntity, requestRecord);
            }

            await queryRunner.commitTransaction();
            return 'send edit request successfully';
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
    async customeCancelOrder(data: CustomerCancelOrder, acc_id: number) {
        const customer = await this.customerRepository.findOne({ where: { acc_id: acc_id } });
        const cus_id = customer ? customer.cus_id : 0;
        const order = await this.orderRepository.findOne({ where: { order_id: data.order_id, cus_id: cus_id } });
        if (!order) {
            return 'order not found';
        }
        const o_stt = Number(order.status.stt_id);
        if (o_stt > 7) {
            return { order_status: o_stt, error: 'canot Cancel this order' };
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const checkIsCancel = await this.requesRecodtRepository
                .createQueryBuilder('rc')
                .leftJoinAndSelect('rc.request', 'r')
                .leftJoinAndSelect('r.order', 'o')
                .leftJoinAndSelect('o.status', 's')
                .where('r.order_id =:order_id', { order_id: order.order_id })
                .andWhere('rc.request_type !=:request_type', { request_type: 1 })
                .getOne();
            if (checkIsCancel) {
                return { error: 'this order is processing cancel or transiting!Canot Cancle this order' };
            }
            const checkRequest = await this.requesRecodtRepository.findOne({
                where: [{ request: { orderId: data.order_id } }, { request_type: 1 }],
            });

            if (checkRequest) {
                //update request record to cacancel
                await this.requesRecodtRepository.update(checkRequest.record_id, { request_type: 2, request_stt: 1 });
            } else {
                //create Request
                const request = new RequestEntity();
                request.requestId = 0;
                request.orderId = order.order_id;
                request.pickupInfor = null;
                request.deliverInfor = null;
                const requestInsertreult = await queryRunner.manager.save(RequestEntity, request);
                //create RequestRecord
                const requestRecord = new RequestRecordEntity();
                requestRecord.record_id = 0;
                requestRecord.refer_id = requestInsertreult.requestId;
                // const reqsetStautus = await this.requestStatusRepository.findOneBy({ rqs_name: 'Processing' });
                requestRecord.request_type = 2;
                requestRecord.request_stt = 1;
                await queryRunner.manager.save(RequestRecordEntity, requestRecord);
            }
            await queryRunner.commitTransaction();
            return 'send Cancel request successfully';
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
    async caculateOrderPrice(data: CaculataOrderPrice, acc_id: number) {
        const pkdata = await this.packageTypeRepository.findOneBy({ pk_id: data.pk_id });
        const getPickupWarehouse = await this.wardRepository.findOneBy({ ward_id: data.pickup_ward_id });
        const getDeliverWarehouse = await this.wardRepository.findOneBy({ ward_id: data.deliver_ward_id });
        if (!getPickupWarehouse || !getDeliverWarehouse) {
            return { error: 'warehouse not found' };
        }
        const pickupWard = Number(getPickupWarehouse.warehouse_id);
        const deliverWard = Number(getPickupWarehouse.warehouse_id);
        const distance = await this.warehouseRuleRepository.findOne({
            where: { warehouse_id_1: pickupWard, warehouse_id_2: deliverWard },
        });
        const mutiplier = await this.checkMutipelPrice(Number(distance.distance));
        const price = Number(pkdata.pk_price);
        return pkdata.pk_id === 4 ? null : { price: mutiplier * price };
    }
    async checkMutipelPrice(distance: number) {
        const priceMultiplier = await this.priceMutiPlierRepository
            .createQueryBuilder('price_multiplier')
            .where('price_multiplier.maxDistance >= :distance', { distance })
            .andWhere('price_multiplier.minDistance < :distance', { distance })
            .orderBy('price_multiplier.minDistance', 'DESC')
            .getOne();
        return Number(priceMultiplier.multiplier);
    }
}
