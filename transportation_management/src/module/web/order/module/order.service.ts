import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/entities/customer.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { Brackets, DataSource, Repository } from 'typeorm';
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
import { PriceMultiplierEntity } from 'src/entities/price-mutiplier.entity';
import { CusCreateOrderDto } from '../dto/customer-create-order.dto';
import { asignShipperDto } from '../dto/asing-shipper-order.dto';
import { OrderStatusEntity } from 'src/entities/order-status.entity';
import { ActivityLogEntity } from 'src/entities/activity-log.entity';
import { ActivityLogStatusEntity } from 'src/entities/activity-log-status.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { Paging } from 'src/module/response/Paging';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(StaffEntity)
        private staffRepository: Repository<StaffEntity>,
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
        @InjectRepository(ActivityLogEntity)
        private activityLogRepository: Repository<ActivityLogEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        private dataSource: DataSource,
    ) {}
    async getAllOrders(accId: number, pageNo: number): Promise<any> {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        const cusId = customer ? customer.cusId : 0;
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
            .orderBy('o.orderId', 'DESC')
            .skip((pageNo - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        const orders = list.map((item) => ({
            orderId: item.orderId,
            pickUpInforId: item.pickupInformation.inforId,
            pickName: item.pickupInformation.name,
            pickPhone: item.pickupInformation.phone,
            pickupAddress: `${item.pickupInformation.address.house}-${item.pickupInformation.address.ward.wardName}-${item.pickupInformation.address.district.districtName}-${item.pickupInformation.address.city.cityName}`,
            pickShiper: item.pickupShipperStaff ? item.pickupShipperStaff.fullname : null,
            deliverInfor: item.deliverInformation.inforId,
            deliverName: item.deliverInformation.name,
            deliverPhone: item.deliverInformation.phone,
            deliverAddress: `${item.deliverInformation.address.house}-${item.deliverInformation.address.ward.wardName}-${item.deliverInformation.address.district.districtName}-${item.deliverInformation.address.city.cityName}`,
            deliverShiper: item.deliverShipperStaff ? item.deliverShipperStaff.fullname : null,
            status: item.status.sttName,
            pakeType: item.packageType.pkName,
            price: item.estimatedPrice,
            paymenMethod: item.paymentMethod ? item.paymentMethod : 1,
            payment: item.payment && item.paymentMethod === 2 ? item.payment : 'cast',
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
    async getAllOrdersSeacrh(accId: number, pageNo: number, orderStatus: number): Promise<any> {
        orderStatus = orderStatus <= 10 && orderStatus >= 1 ? orderStatus : 0;
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        const cusId = customer ? customer.cusId : 0;
        console.log(pageNo);
        //const orders = await this.orderRepository.findOne({ where: { cusId: cusId } });
        const pageSize = Number(process.env.PAGE_SIZE);
        const queryBuilder = await this.orderRepository
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
            .orderBy('o.orderId', 'DESC')
            .skip((pageNo - 1) * pageSize)
            .take(pageSize);
        if (orderStatus !== 0) {
            queryBuilder.andWhere('o.order_stt = :orderStatus', { orderStatus: orderStatus });
        }
        const [list, count] = await queryBuilder.getManyAndCount();
        const orders = list.map((item) => ({
            orderId: item.orderId,
            pickUpInforId: item.pickupInformation.inforId,
            pickName: item.pickupInformation.name,
            pickPhone: item.pickupInformation.phone,
            pickupAddress: `${item.pickupInformation.address.house}-${item.pickupInformation.address.ward.wardName}-${item.pickupInformation.address.district.districtName}-${item.pickupInformation.address.city.cityName}`,
            pickShiper: item.pickupShipperStaff ? item.pickupShipperStaff.fullname : null,
            deliverInfor: item.deliverInformation.inforId,
            deliverName: item.deliverInformation.name,
            deliverPhone: item.deliverInformation.phone,
            deliverAddress: `${item.deliverInformation.address.house}-${item.deliverInformation.address.ward.wardName}-${item.deliverInformation.address.district.districtName}-${item.deliverInformation.address.city.cityName}`,
            deliverShiper: item.deliverShipperStaff ? item.deliverShipperStaff.fullname : null,
            status: item.status.sttName,
            pakeType: item.packageType.pkName,
            price: item.estimatedPrice,
            paymenMethod: item.paymentMethod ? item.paymentMethod : 1,
            payment: item.payment && item.paymentMethod === 2 ? item.payment : 'cast',
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
    async getallOrderLog(accid, orderId) {
        const activitylog = await this.activityLogRepository
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.logStatus', 's')
            .where('a.order_id =:orderId', { orderId: orderId })
            .orderBy('a.logId', 'DESC')
            .getMany();
        return activitylog ? activitylog : 'error';
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
                  pickUpInforId: dataQuery.pickUpInforId,
                  pickName: dataQuery.pickupInformation.name,
                  pickPhone: dataQuery.pickupInformation.phone,
                  pickCity: dataQuery.pickupInformation.address.city.cityName,
                  pickDistrict: dataQuery.pickupInformation.address.district.districtName,
                  pickupWardId: dataQuery.pickupInformation.address.wardId,
                  pickWard: dataQuery.pickupInformation.address.ward.wardName,
                  pickShiper: dataQuery.pickupShipperStaff ? dataQuery.pickupShipperStaff.fullname : null,
                  deliverInforId: dataQuery.deliverInforId,
                  deliverName: dataQuery.deliverInformation.name,
                  deliverPhone: dataQuery.deliverInformation.phone,
                  deliverCity: dataQuery.deliverInformation.address.city.cityName,
                  deliverDistrict: dataQuery.deliverInformation.address.district.districtName,
                  deliverWard: dataQuery.deliverInformation.address.ward.wardName,
                  deliverShiper: dataQuery.deliverShipperStaff ? dataQuery.deliverShipper.fullname : null,
                  statusId: dataQuery.orderStt,
                  status: dataQuery.status.sttName,
                  pakeType: dataQuery.packageType.pkName,
                  price: dataQuery.estimatedPrice,
                  paymenMethod: dataQuery.paymentMethod ? dataQuery.paymentMethod : 1,
                  payment: dataQuery.payment && dataQuery.paymentMethod === 2 ? dataQuery.payment : 'cast',
                  confirmurl: dataQuery.imageVerifyUrl ? dataQuery.imageVerifyUrl : '',
              }
            : null;
        return order ? order : 'query error or not found';
    }

    async createOrder(data: CusCreateOrderDto, accId: number): Promise<any> {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        const cusId = customer ? customer.cusId : 0;
        data.cusId = cusId;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            //create order
            const order = new OrderEntity();
            order.orderId = 0;
            order.cusId = cusId;
            order.pickupInforId = data.pickupInforId;
            order.pickupShipper = null;
            order.deliverInforId = data.deliver_infor_id;
            order.deliverShipper = null;
            order.orderStt = 1;
            order.pkId = data.pkId;
            order.estimatedPrice = data.estimatedPrice;
            order.paymentMethod = data.paymentMethod ? data.paymentMethod : 1;
            order.payment = data.paymentMethod === 2 ? data.payment : '';
            await queryRunner.manager.save(OrderEntity, order);
            //create ActivityLog
            const activityLog = await this.ActivitylogOrder(order.orderId, 1, accId);
            await queryRunner.manager.save(ActivityLogEntity, activityLog);
            await queryRunner.commitTransaction();
            return { status: 200, msg: 'success' };
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
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const checkRequestLigal = await this.requesRecodtRepository
                .createQueryBuilder('rc')
                .leftJoinAndSelect('rc.requests', 'r')
                .leftJoinAndSelect('r.order', 'o')
                .leftJoinAndSelect('o.status', 's')
                .leftJoinAndSelect('r.deliverInformation', 'di')
                .leftJoinAndSelect('di.address', 'a')
                .where('rc.request_type =:requestType', { requestType: 1 })
                .andWhere('r.order_id =:orderId', { orderId: order.orderId })
                .getOne();
            if (checkRequestLigal) {
                // update request
                const requestupdate: RequestEntity = checkRequestLigal.requests;
                const deliverupdate = new InformationEntity();
                deliverupdate.inforId = data.deliverInforId;
                requestupdate.deliverInfor = data.deliverInforId;
                requestupdate.new_price = data.newPrice ? Number(data.newPrice) : 0;
                requestupdate.deliverInformation = deliverupdate;
                await queryRunner.manager.save(requestupdate);
                //update requestRecord
                const requestType = new RequestTypeEntity();
                requestType.requestTypeId = 1;
                const requestStatus = new RequestStatusEntity();
                requestStatus.rqs_id = 1;
                checkRequestLigal.requestType = 1;
                checkRequestLigal.requestStt = 1;
                checkRequestLigal.requestTypeTable = requestType;
                checkRequestLigal.requestStatus = requestStatus;
                checkRequestLigal.note = data.note;
                await queryRunner.manager.save(checkRequestLigal);
            } else {
                //create requestRecord
                const requestType = new RequestTypeEntity();
                requestType.requestTypeId = 1;
                const requestStatus = new RequestStatusEntity();
                requestStatus.rqs_id = 1;
                const requestRecord = new RequestRecordEntity();
                requestRecord.recordId = 0;
                requestRecord.requestType = 1;
                requestRecord.requestTypeTable = requestType;
                requestRecord.requestStt = 1;
                requestRecord.requestStatus = requestStatus;
                requestRecord.note = data.note;
                const recordUpdate = await queryRunner.manager.save(RequestRecordEntity, requestRecord);
                //create request
                const request = new RequestEntity();
                request.requestId = 0;
                request.recordId = recordUpdate.recordId;
                request.order = order;
                request.orderId = data.orderId;
                const deliver = new InformationEntity();
                deliver.inforId = data.deliverInforId;
                request.pickupInfor = order.pickupInforId;
                request.pickupInformation = order.pickupInformation;
                request.deliverInfor = data.deliverInforId;
                request.deliverInformation = deliver;
                request.new_price = data.newPrice ? Number(data.newPrice) : 0;
                await queryRunner.manager.save(RequestEntity, request);
            }
            //create ActivityLog
            const activityLog = await this.ActivitylogOrder(order.orderId, 10, accId);
            await queryRunner.manager.save(ActivityLogEntity, activityLog);
            await queryRunner.commitTransaction();
            return { status: 200, msg: 'send edit request successfully' };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
    async getCustomerOrderInWhouse(accId: number, pageNo: number) {
        const staff = await this.staffRepository.findOne({ where: { accId: accId } });
        const warehouseId = staff ? staff.warehouseId : 0;
        const pageSize = Number(process.env.PAGE_SIZE);
        const customerOrders = await this.orderRepository
            .createQueryBuilder('order')
            .select([
                'customer.cus_id AS cusId',
                'customer.fullname AS customerName',
                'customer.email AS customerEmail',
                'customer.status AS customerStatus',
                'customer.phone AS customerPhone',
                'COUNT(order.order_id) AS totalOrder',
            ])
            .leftJoin('order.customer', 'customer')
            .leftJoin('order.pickupInformation', 'pickupInformation')
            .leftJoin('order.deliverInformation', 'deliverInformation')
            .leftJoin('pickupInformation.address', 'pickupAddress')
            .leftJoin('pickupAddress.city', 'pickupCity')
            .leftJoin('pickupAddress.district', 'pickupDistrict')
            .leftJoin('pickupAddress.ward', 'pickupWard')
            .leftJoin('deliverInformation.address', 'deliverAddress')
            .leftJoin('deliverAddress.city', 'deliverCity')
            .leftJoin('deliverAddress.district', 'deliverDistrict')
            .leftJoin('deliverAddress.ward', 'deliverWard')
            .where(
                new Brackets((qb) => {
                    qb.where('pickupWard.warehouse_id = :warehouseId', {
                        warehouseId: warehouseId,
                    }).orWhere('deliverWard.warehouse_id = :warehouseId', { warehouseId: warehouseId });
                }),
            )
            .skip((pageNo - 1) * pageSize)
            .take(pageSize)
            .groupBy('customer.cus_id, customer.fullname, customer.email, customer.phone')
            .getRawMany();
        const totalOrderInWarehouse = customerOrders.reduce((acc, curr) => acc + parseInt(curr.totalorder, 10), 0);

        const count = customerOrders.length;
        const pageing = new Paging(pageNo, pageSize, count);
        return { data: customerOrders, pageing: pageing, totalOrderInWarehouse: totalOrderInWarehouse };
    }

    async customeCancelOrder(data: CustomerCancelOrder, accId: number) {
        const customer = await this.customerRepository.findOne({ where: { accId: accId } });
        const cusId = customer ? customer.cusId : 0;
        const order = await this.orderRepository.findOne({ where: { orderId: data.orderId, cusId: cusId } });
        if (!order) {
            return 'order not found';
        }
        const oStt = Number(order.status.sttId);
        if (oStt > 4) {
            return { orderStatus: oStt, error: 'canot Cancel this order' };
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const checkHaveRequest = await this.requesRecodtRepository
                .createQueryBuilder('rc')
                .leftJoinAndSelect('rc.requests', 'r')
                .leftJoinAndSelect('r.order', 'o')
                .leftJoinAndSelect('o.status', 's')
                .where('r.order_id =:orderId', { orderId: order.orderId })
                .getOne();
            if (checkHaveRequest && checkHaveRequest.requestType === 2) {
                return {
                    status: HttpStatus.CONFLICT,
                    error: 'this order is processing cancel or was cancel!Canot re Cancel again this order',
                };
            }
            if (order.orderStt === 1 || order.orderStt === 2) {
                // update order to cancel
                const orderStatus = new OrderStatusEntity();
                orderStatus.sttId = 10;
                order.status = orderStatus;
                order.estimatedPrice = 0;
                await queryRunner.manager.save(order);
                if (!checkHaveRequest) {
                    // update request record
                    await this.requesRecodtRepository.update(checkHaveRequest.recordId, {
                        requestType: 2,
                        requestStt: 1,
                    });
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
                    request.pickupInfor = order.pickupInforId;
                    request.deliverInfor = order.deliverInforId;
                    request.recordId = requestRecordInsertreult.recordId;
                    await queryRunner.manager.save(RequestEntity, request);
                }
                // log activity order to 15
                //create ActivityLog
                const activityLog = await this.ActivitylogOrder(order.orderId, 16, accId);
                await queryRunner.manager.save(ActivityLogEntity, activityLog);
                await queryRunner.commitTransaction();
                return { status: 200, msg: ' Cancel successfully' };
            }
            if (checkHaveRequest && checkHaveRequest.requestType === 1) {
                //update request record to cacancel
                await this.requesRecodtRepository.update(checkHaveRequest.recordId, { requestType: 2, requestStt: 1 });
            } else if (!checkHaveRequest) {
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
                request.pickupInfor = order.pickupInforId;
                request.deliverInfor = order.deliverInforId;
                request.recordId = requestRecordInsertreult.recordId;
                await queryRunner.manager.save(RequestEntity, request);
            }
            //create ActivityLog
            const activityLog = await this.ActivitylogOrder(order.orderId, 13, accId);
            await queryRunner.manager.save(ActivityLogEntity, activityLog);
            await queryRunner.commitTransaction();
            return { status: 200, msg: 'send Cancel request successfully' };
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
        const warehouseRule = await this.warehouseRuleRepository
            .createQueryBuilder('w')
            .where((qb) => {
                qb.andWhere('(w.warehouse_id_1 = :warehouseId1 AND w.warehouse_id_2 = :warehouseId2)', {
                    warehouseId1: pickupWarehouse,
                    warehouseId2: deliverWarehouse,
                }).orWhere('(w.warehouse_id_1 = :warehouseId2 AND w.warehouse_id_2 = :warehouseId1)', {
                    warehouseId1: pickupWarehouse,
                    warehouseId2: deliverWarehouse,
                });
            })
            .getOne();
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

    async asignShipperToOrder(data: asignShipperDto, accId) {
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
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            //update order
            order.status = orderStatus;
            await queryRunner.manager.save(order);
            //create ActivityLog
            const activityLog = await this.ActivitylogOrder(order.orderId, orderStatus.sttId, accId);
            await queryRunner.manager.save(ActivityLogEntity, activityLog);
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }

        return 'assign shipper successfully';
    }
    async ActivitylogOrder(orderId: number, status: number, accId: number): Promise<ActivityLogEntity> {
        const activityLog = new ActivityLogEntity();
        const activitystatus = new ActivityLogStatusEntity();
        activityLog.logId = 0;
        activityLog.orderId = orderId;
        activityLog.currentStatus = status;
        activitystatus.alsttId = status;
        activityLog.accId = accId;
        activityLog.time = new Date();
        return activityLog;
    }
}
