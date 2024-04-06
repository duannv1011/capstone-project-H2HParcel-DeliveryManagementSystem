import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/entities/customer.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { InformationEntity } from 'src/entities/information.entity';
import { AddressEntity } from 'src/entities/address.entity';
import { CustomerEditOrder } from '../dto/custoemr-edit-order.dto';
import { RequestEntity } from 'src/entities/request.entity';
import { RequestRecordEntity } from 'src/entities/request-record.entity';
import { AddressBookEntity } from 'src/entities/address-book.entity';
import { RequestStatusEntity } from 'src/entities/request-status.entity';
import { RequestTypeEntity } from 'src/entities/request-type.entity';
import { CustomerCancelOrder } from '../dto/customer-cancel-order.dto';
import { PackageTypeEntity } from 'src/entities/package-type.entity';
import { CaculataOrderPrice } from '../dto/caculate-order-price.dto';
import { WardEntity } from 'src/entities/ward.entity';
import { WarehouseRuleEntity } from 'src/entities/warehouse-rule.entity';
import { PriceMultiplierEntity } from 'src/entities/price-mutiplỉe.entity';
import { CusCreateOrderDto } from '../dto/customer-create-order.dto';
import { asignShipperDto } from '../dto/asing-shipper-order.dto';
import { OrderStatusEntity } from 'src/entities/order-status.entity';
import { ActivityLogEntity } from 'src/entities/activity-log.entity';

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

    async getAllOrders(accId: number, pageNo: number): Promise<any> {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        const cusId = customer ? customer.cusId : 0;
        console.log(pageNo);
        //const orders = await this.orderRepository.findOne({ where: { cusId: cusId } });
        const pageSize = Number(process.env.PAGE_SIZE);
        const [list, count] = await this.orderRepository
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
            .where('o.cus_id = :cusId', { cusId: cusId })
            .skip((pageNo - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        const orders = list.map((item) => ({
            orderId: item.orderId,
            pickName: item.pickupInformation.name,
            pickPhone: item.pickupInformation.phone,
            pickCity: item.pickupInformation.address.city.cityName,
            pickDistrict: item.pickupInformation.address.district.districtName,
            pickWard: item.pickupInformation.address.ward.wardName,
            pickShiper: item.pickupShipperStaff ? item.pickupShipperStaff.fullname : null,
            deliverName: item.deliverInformation.name,
            deliverPhone: item.deliverInformation.phone,
            deliverCity: item.deliverInformation.address.city.cityName,
            deliverDistrict: item.deliverInformation.address.district.districtName,
            deliverWard: item.deliverInformation.address.ward.wardName,
            deliverShiper: item.deliverShipperStaff ? item.deliverShipperStaff.fullname : null,
            status: item.status.sttName,
            pakeType: item.packageType.pkName,
            price: item.estimatedPrice,
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

    async getDetailOrder(orderId: number, accId: number): Promise<any> {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        const cusId = customer ? customer.cusId : 0;
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
            .where('o.cus_id = :cusId', { cusId: cusId })
            .andWhere('o.order_id = :orderId', { orderId: orderId })
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
                  statusId: dataQuery.statusId,
                  status: dataQuery.status.sttName,
                  pakeType: dataQuery.packageType.pkName,
                  price: dataQuery.estimatedPrice,
              }
            : null;
        return order ? order : 'query error or not found';
    }

    async createOrder(data: CusCreateOrderDto, accId: number): Promise<any> {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        const cusId = customer ? customer.cusId : 0;
        data.cusId = cusId;
        const checkPickupInfor = await this.addressbookRepository.findOne({
            where: { cusId: cusId, inforId: data.pickupInforId ? data.pickupInforId : 0 },
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
                address1.addressId = 0;
                address1.house = data.pickupHouse;
                address1.cityId = data.pickupCityId;
                address1.districtId = data.pickupDistrictId;
                address1.wardId = data.pickupWardId;
                const address1Insert = await queryRunner.manager.save(AddressEntity, address1);
                // create information
                const pickupIf = new InformationEntity();
                pickupIf.inforId = 0;
                pickupIf.name = data.pickupName;
                pickupIf.phone = data.pickupPhone;
                pickupIf.address = address1Insert;
                const pickupinforInsert = await queryRunner.manager.save(InformationEntity, pickupIf);
                puinforid = pickupinforInsert.inforId;
            } else {
                puinforid = checkPickupInfor.inforId;
            }
            // create new information (deliver information)
            // create adress
            const address2 = new AddressEntity();
            address2.addressId = 0;
            address2.house = data.pickupHouse;
            address2.cityId = data.pickupCityId;
            address2.districtId = data.pickupDistrictId;
            address2.wardId = data.pickupWardId;
            const address2Insert = await queryRunner.manager.save(AddressEntity, address2);
            // create information
            const deliverIf = new InformationEntity();
            deliverIf.inforId = 0;
            deliverIf.name = data.pickupName;
            deliverIf.phone = data.pickupPhone;
            deliverIf.address = address2Insert;
            const deliverinforInsert = await queryRunner.manager.save(InformationEntity, deliverIf);
            const dlvInforId = deliverinforInsert.inforId;
            //create order
            const order = new OrderEntity();
            order.orderId = 0;
            order.cusId = cusId;
            order.pickupInforId = puinforid;
            order.pickupShipper = null;
            order.deliverInforId = dlvInforId;
            order.deliverShipper = null;
            order.orderStt = 1;
            order.pkId = data.pkId;
            order.estimatedPrice = data.estimatedPrice;
            const orderCreated = await queryRunner.manager.save(OrderEntity, order);
            //create ActivityLog
            const activityLog = new ActivityLogEntity();
            activityLog.staffId = null;
            activityLog.logId = 0;
            activityLog.orderId = order.orderId;
            activityLog.time = new Date();
            activityLog.currentStatus = orderCreated.orderStt;
            await queryRunner.manager.save(activityLog);
            await queryRunner.commitTransaction();
            return 'create order successfully';
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async customeEditOrder(data: CustomerEditOrder, accId: number) {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        const cusId = customer ? customer.cusId : 0;
        const order = await this.orderRepository.findOne({ where: { orderId: data.orderId, cusId: cusId } });
        if (!order) {
            return 'order not found';
        }
        const oStt = Number(order.status.sttId);
        if (oStt > 4 || oStt < 1) {
            return { orderStatus: oStt, error: 'canot update this order' };
        }
        const checkIsCancel = await this.requestRepository
            .createQueryBuilder('r')
            .leftJoinAndSelect('r.requesrRecord', 'rc')
            .leftJoinAndSelect('r.order', 'o')
            .leftJoinAndSelect('o.status', 's')
            .where('rc.request_type !=:requestType', { requestType: 1 })
            .andWhere('r.order_id =:orderId', { orderId: order.orderId })
            .getOne();
        if (checkIsCancel) {
            return 'this order is Cancel or delivered';
        }
        // const checkPickupInfor = await this.addressbookRepository.findOne({
        //     where: { cusId: cusId, inforId: data.pickupInforId ? data.pickupInforId : 0 },
        // });
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // create or set exisited pickupinforid to be use
            // create or set exisited pickupinforid to be use
            //const puinforid = 0;

            // if (oStt === 1) {
            //     if (!checkPickupInfor) {
            //         // create adress
            //         const address1 = new AddressEntity();
            //         address1.addressId = 0;
            //         address1.house = data.pickupHouse;
            //         address1.cityId = data.pickupCityId;
            //         address1.districtId = data.pickupDistrictId;
            //         address1.wardId = data.pickupWardId;
            //         const address1Insert = await queryRunner.manager.save(AddressEntity, address1);
            //         // create information
            //         const pickupIf = new InformationEntity();
            //         pickupIf.inforId = 0;
            //         pickupIf.name = data.pickupName;
            //         pickupIf.phone = data.pickupPhone;
            //         pickupIf.address = address1Insert;
            //         const pickupinforInsert = await queryRunner.manager.save(InformationEntity, pickupIf);
            //         puinforid = pickupinforInsert.inforId;
            //         console.log('stt=1 , new pickup:' + puinforid);
            //     } else {
            //         puinforid = checkPickupInfor.inforId;
            //         console.log('stt=1, old pickup' + puinforid);
            //     }
            // }
            // console.log(puinforid);

            // create new information (deliyver information)
            const checkRequestLigal = await this.requestRepository
                .createQueryBuilder('r')
                .leftJoinAndSelect('r.requesrRecord', 'rc')
                .leftJoinAndSelect('r.order', 'o')
                .leftJoinAndSelect('o.status', 's')
                .leftJoinAndSelect('r.deliverInformation', 'di')
                .leftJoinAndSelect('di.address', 'a')
                .where('rc.request_type =:requestType', { requestType: 1 })
                .where('rc.request_stt =:requestStt', { requestStt: 1 })
                .andWhere('r.order_id =:orderId', { orderId: order.orderId })
                .getOne();

            if (!checkRequestLigal) {
                //create deliver address
                const address2 = new AddressEntity();
                address2.addressId = 0;
                address2.house = data.deliverHouse;
                address2.cityId = data.deliverCityId;
                address2.districtId = data.deliverDistrictId;
                address2.wardId = data.deliverWardId;
                const address2Insert = await queryRunner.manager.save(AddressEntity, address2);
                // create deliver information
                const deliverIf = new InformationEntity();
                deliverIf.inforId = 0;
                deliverIf.name = data.deliverName;
                deliverIf.phone = data.deliverPhone;
                deliverIf.address = address2Insert;
                const deliverinforInsert = await queryRunner.manager.save(InformationEntity, deliverIf);
                const dlvInforId = deliverinforInsert.inforId;
                //create RequestRecord
                const requestRecord = new RequestRecordEntity();
                requestRecord.recordId = 0;
                requestRecord.requestType = 1;
                requestRecord.requestStt = 1;
                requestRecord.note = data.note;
                const requestRcInsertreult = await queryRunner.manager.save(RequestRecordEntity, requestRecord);
                //create  Request
                const request = new RequestEntity();
                request.requestId = 0;
                request.recordId = requestRcInsertreult.recordId;
                request.orderId = order.orderId;
                request.pickupInfor = order.pickupInforId;
                request.deliverInfor = dlvInforId;
                await queryRunner.manager.save(RequestEntity, request);
            } else {
                //update deliver address
                const address = await queryRunner.manager.findOneBy(AddressEntity, {
                    addressId: checkRequestLigal.deliverInformation.address.addressId,
                });
                address.house = data.deliverHouse;
                address.cityId = data.deliverCityId;
                address.districtId = data.deliverDistrictId;
                address.wardId = data.deliverWardId;
                console.log(address.house);
                await queryRunner.manager.save(AddressEntity, address);
                //update deliver information
                const deliverIf = await queryRunner.manager.findOneBy(InformationEntity, {
                    inforId: checkRequestLigal.deliverInformation.inforId,
                });
                deliverIf.name = data.deliverName;
                deliverIf.phone = data.deliverPhone;
                await queryRunner.manager.save(InformationEntity, deliverIf);
                //update request record
                const requestRecord = await queryRunner.manager.findOneBy(RequestRecordEntity, {
                    recordId: checkRequestLigal.recordId,
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

    async customeCancelOrder(data: CustomerCancelOrder, accId: number) {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        const cusId = customer ? customer.cusId : 0;
        const order = await this.orderRepository.findOne({ where: { orderId: data.orderId, cusId: cusId } });
        if (!order) {
            return 'order not found';
        }
        const oStt = Number(order.status.sttId);
        if (oStt > 7) {
            return { orderStatus: oStt, error: 'canot Cancel this order' };
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
                .where('r.order_id =:order_id', { orderId: order.orderId })
                .andWhere('rc.request_type !=:requestType', { requestType: 1 })
                .getOne();
            if (checkIsCancel) {
                return { error: 'this order is processing cancel or transiting!Canot Cancle this order' };
            }
            const request = await this.requestRepository.findOneBy({ orderId: data.orderId });
            const checkRequest = await this.requesRecodtRepository.findOne({
                where: { recordId: request.recordId, requestType: 1 },
            });

            if (checkRequest) {
                //update request record to cacancel
                await this.requesRecodtRepository.update(checkRequest.recordId, { requestType: 2, requestStt: 1 });
            } else {
                //create RequestRecord
                const requestRecord = new RequestRecordEntity();
                requestRecord.recordId = 0;
                requestRecord.requestType = 2;
                requestRecord.requestStt = 1;
                requestRecord.note = data.note;
                const requestRecordInsertreult = await queryRunner.manager.save(RequestRecordEntity, requestRecord);
                //create Request
                const request = new RequestEntity();
                request.requestId = 0;
                request.orderId = order.orderId;
                request.pickupInfor = null;
                request.deliverInfor = null;
                request.recordId = requestRecordInsertreult.recordId;
                await queryRunner.manager.save(RequestEntity, request);
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

    async caculateOrderPrice(data: CaculataOrderPrice) {
        const pkdata = await this.packageTypeRepository.findOneBy({ pkId: data.pkId });
        const getPickupWarehouse = await this.wardRepository.findOneBy({ wardId: data.pickupWardId });
        const getDeliverWarehouse = await this.wardRepository.findOneBy({ wardId: data.deliverWardId });
        if (!getPickupWarehouse || !getDeliverWarehouse) {
            return { error: 'warehouse not found' };
        }
        const pickupWarehouse = Number(getPickupWarehouse.warehouseId);
        const deliverWarehouse = Number(getDeliverWarehouse.warehouseId);
        const warehouseRule = await this.warehouseRuleRepository.findOne({
            where: { warehouseId1: pickupWarehouse, warehouseId2: deliverWarehouse },
        });
        const distance = Number(
            warehouseRule.distance.includes(',') ? warehouseRule.distance.replace(',', '.') : warehouseRule.distance,
        );
        const price = Number(pkdata.pkPrice);
        if (distance === 0) {
            return pkdata.pkId === 4 ? null : { price: price, distance: distance };
        }
        const mutiplier = await this.checkMutipelPrice(Number(distance));
        return pkdata.pkId === 4 ? null : { price: mutiplier * price, distance: distance };
    }

    async checkMutipelPrice(distance: number) {
        const num = distance.toFixed();
        const priceMultiplier = await this.priceMutiPlierRepository
            .createQueryBuilder('p')
            .where('p.max_distance >= :num', { num })
            .andWhere('p.min_distance < :num', { num })
            .orderBy('p.minDistance', 'DESC')
            .getOne();
        return Number(priceMultiplier.multiplier);
    }

    async asignShipperToOrder(data: asignShipperDto) {
        const order = await this.orderRepository.findOneBy({ orderId: data.orderId });
        const orderStatus = new OrderStatusEntity();

        if ([1, 2].includes(order.orderStt)) {
            orderStatus.sttId = 2;
            order.pickupShipper = data.shiperrId;
        }

        if ([6, 7].includes(order.orderStt)) {
            orderStatus.sttId = 7;
            order.deliverShipper = data.shiperrId;
        }

        order.status = orderStatus;
        await this.orderRepository.save(order);
        return 'assign shipper successfully';
    }
}
