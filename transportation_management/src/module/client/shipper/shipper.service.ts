import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from 'src/entities/address.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { OrderStatusEntity } from 'src/entities/order-status.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { StaffEntity } from 'src/entities/staff.entity';
import { WarehouseEntity } from 'src/entities/warehouse.entity';
import { Paging } from 'src/module/response/Paging';
import { Brackets, DataSource, Repository } from 'typeorm';
import { GoogleDriveService } from 'nestjs-googledrive-upload';
import { ActivityLogEntity } from 'src/entities/activity-log.entity';
import { ActivityLogStatusEntity } from 'src/entities/activity-log-status.entity';
import * as _ from 'lodash';
import { TransitEntity } from 'src/entities/transit.entity';
import { PriceMultiplierEntity } from 'src/entities/price-mutiplier.entity';
import { WarehouseRuleEntity } from 'src/entities/warehouse-rule.entity';
import { PayRuleEntity } from 'src/entities/pay-rule.entity';
@Injectable()
export class ShipperService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(TransitEntity)
        private transitRepository: Repository<TransitEntity>,
        @InjectRepository(ActivityLogEntity)
        private activityLogRepository: Repository<ActivityLogEntity>,
        @InjectRepository(WarehouseRuleEntity)
        private warehouseRuleRepository: Repository<WarehouseRuleEntity>,
        @InjectRepository(CustomerEntity)
        private customerEntity: Repository<CustomerEntity>,
        @InjectRepository(PriceMultiplierEntity)
        private priceMutiPlierRepository: Repository<PriceMultiplierEntity>,
        @InjectRepository(StaffEntity)
        private staffEntity: Repository<StaffEntity>,
        @InjectRepository(PayRuleEntity)
        private payRuleEntity: Repository<PayRuleEntity>,
        @InjectRepository(WarehouseEntity)
        private warehouseRepository: Repository<WarehouseEntity>,
        @InjectRepository(AddressEntity)
        private addressRepository: Repository<AddressEntity>,
        private dataSource: DataSource,
        private readonly googleDriveService: GoogleDriveService,
    ) {}
    private orderDirection: string = 'ASC';
    private setOrderDirection(orderby: string) {
        this.orderDirection = orderby;
    }
    private getOrderDirection() {
        return this.orderDirection;
    }
    async checkMutipelPrice(warehouseFrom: number, warehouseTo: number) {
        const warehouseRule = await this.warehouseRuleRepository
            .createQueryBuilder('w')
            .where((qb) => {
                qb.andWhere('(w.warehouse_id_1 = :warehouseId1 AND w.warehouse_id_2 = :warehouseId2)', {
                    warehouseId1: warehouseFrom,
                    warehouseId2: warehouseTo,
                }).orWhere('(w.warehouse_id_1 = :warehouseId2 AND w.warehouse_id_2 = :warehouseId1)', {
                    warehouseId1: warehouseFrom,
                    warehouseId2: warehouseTo,
                });
            })
            .getOne();
        const distance = Number(
            warehouseRule.distance.includes(',') ? warehouseRule.distance.replace(',', '.') : warehouseRule.distance,
        );
        const num = distance.toFixed();
        const priceMultiplier = await this.priceMutiPlierRepository
            .createQueryBuilder('p')
            .where('p.max_distance >= :num', { num })
            .andWhere('p.min_distance < :num', { num })
            .orderBy('p.minDistance', 'DESC')
            .getOne();
        return Number(priceMultiplier.id);
    }
    async getShiperPayslip(accId: number) {
        const shiper = await this.staffEntity.findOneBy({ accId: accId });
        if (!shiper) {
            return { status: 404, error: 'Not Found' };
        }
        const payrule = await this.payRuleEntity.find();
        const rule = payrule.reduce((acc, item) => {
            acc[item.ruleId] = item.effort;
            return acc;
        }, {});
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const shiperId = shiper.staffId;
        const transits = await this.transitRepository.findBy({ staffId: shiperId });
        const mutiplier = [];
        for (const tran of transits) {
            const mul = await this.checkMutipelPrice(tran.warehouseFrom, tran.warehouseTo);
            if (mul) {
                mutiplier.push(mul);
            }
        }
        const idCounts = _.countBy(mutiplier);
        let transitefort = 0;
        let transitTotal1 = 0;
        let transitTotal2 = 0;
        let transitTotal3 = 0;
        for (const [key, value] of Object.entries(idCounts)) {
            switch (key) {
                case '1':
                    transitTotal1 = value;
                    transitefort += value * rule[6];
                    break;
                case '2':
                    transitTotal2 = value;
                    transitefort += value * rule[7];
                    break;
                case '3':
                    transitTotal3 = value;
                    transitefort += value * rule[8];
                    break;
                default:
                    break;
            }
        }
        const [orders, count] = await this.orderRepository
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.pickupInformation', 'pi')
            .leftJoinAndSelect('o.deliverInformation', 'di')
            .where('o.orderStt = :stt', { stt: 9 })
            .andWhere('extract(month from o.date_update_at) = :month', { month: currentMonth })
            .andWhere(
                new Brackets((qb) => {
                    qb.where('o.pickupShipper = :puShipperId', {
                        puShipperId: shiperId,
                    }).orWhere('o.deliverShipper = :diShipperId', { diShipperId: shiperId });
                }),
            )
            .getManyAndCount();
        const pickupOrders = orders.filter((order) => order.pickupShipper === shiperId);
        const deliverOrders = orders.filter((order) => order.deliverShipper === shiperId);
        const pickupEffort = pickupOrders.reduce((acc, order) => {
            switch (order.pkId) {
                case 1:
                    return acc + rule[2] * 0.4;
                case 2:
                    return acc + rule[3] * 0.4;
                case 3:
                    return acc + rule[4] * 0.4;
                case 4:
                    return acc + rule[5] * 0.4;
                default:
                    return acc;
            }
        }, 0);
        const deliverEffort = deliverOrders.reduce((acc, order) => {
            switch (order.pkId) {
                case 1:
                    return acc + rule[2] * 0.6;
                case 2:
                    return acc + rule[3] * 0.6;
                case 3:
                    return acc + rule[4] * 0.6;
                case 4:
                    return acc + rule[5] * 0.6;
                default:
                    return acc;
            }
        }, 0); // 60% for deliver
        //transit
        const totalEffort = pickupEffort + deliverEffort + transitefort;
        const totalOrder = count;
        const totalOrderPickup = pickupOrders.length;
        const totalOrderDeliver = deliverOrders.length;
        return {
            status: 200,
            data: {
                shiper: shiper.fullname,
                month: currentMonth,
                totalOrder: totalOrder,
                totalOrderPickup: totalOrderPickup,
                totalOrderDeliver: totalOrderDeliver,
                transit0_5: transitTotal1,
                transit5_10: transitTotal2,
                transit10_200: transitTotal3,
                totalTransit: transits.length,
                totalEffort: totalEffort,
                salary: totalEffort * 2750,
            },
        };
    }

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
    async getAllorderSearch(pageNo: number, accId, orderStatus: number): Promise<any> {
        orderStatus = orderStatus <= 10 && orderStatus >= 1 ? orderStatus : 0;
        // searchValue = searchValue ? searchValue.trim().toUpperCase() : '';
        // console.log(searchValue);
        const pageSize = Number(process.env.PAGE_SIZE);
        const shipper = await this.staffEntity.findOneBy({ accId: accId });
        const shipperId = Number(shipper.staffId);
        const query = await this.orderRepository
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
            // .andWhere(
            //     new Brackets((qb) => {
            //         qb.where('UPPER(ps.fullname) LIKE :pfullname', { pfullname: `%${searchValue}%` })
            //             .orWhere('UPPER(ds.fullname) LIKE :dfullname', {
            //                 dfullname: `%${searchValue}%`,
            //             })
            //             .orWhere('UPPER(pi.name) LIKE :pifullname', { pifullname: `%${searchValue}%` })
            //             .orWhere('UPPER(pi.phone) LIKE :piphone', { piphone: `%${searchValue}%` })
            //             .orWhere('UPPER(di.name) LIKE :pifullname', { pifullname: `%${searchValue}%` })
            //             .orWhere('UPPER(di.phone) LIKE :piphone', { piphone: `%${searchValue}%` });
            //     }),
            // )
            .skip((pageNo - 1) * pageSize)
            .take(pageSize);
        if (orderStatus !== 0) {
            query.andWhere('o.order_stt = :orderStatus', { orderStatus: orderStatus });
        }
        query.orderBy('o.orderId', 'DESC');
        // if (this.getOrderDirection() === 'ASC') {
        //     query.orderBy('o.orderId', 'ASC');
        //     this.setOrderDirection('DESC');
        // } else {
        //     query.orderBy('o.orderId', 'DESC');
        //     this.setOrderDirection('ASC');
        // }
        const [orders, count] = await query.getManyAndCount();
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

    async shiperUpdateprice(order_id: number, price: number) {
        const order = await this.orderRepository.findOneBy({ orderId: order_id });
        if (order.pkId != 4) {
            return 'Packgage type iligal to update';
        }
        if (order) {
            order.estimatedPrice = price;
            try {
                await this.orderRepository.save(order);
            } catch (error) {
                throw new InternalServerErrorException(error);
            }
        } else {
            throw new InternalServerErrorException('order not found');
        }
    }
    async shiperCancelOrder(order_id: number, accId: number) {
        const order = await this.orderRepository.findOneBy({ orderId: order_id });

        if (order) {
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                // update order
                const orderStatus = new OrderStatusEntity();
                orderStatus.sttId = 10;
                order.status = orderStatus;
                await queryRunner.manager.save(order);
                // create activity log
                const activityLog = await this.ActivitylogOrder(order.orderId, 18, accId);
                await queryRunner.manager.save(ActivityLogEntity, activityLog);
                await queryRunner.commitTransaction();
            } catch (error) {
                await queryRunner.rollbackTransaction();
                throw new InternalServerErrorException(error);
            } finally {
                await queryRunner.release();
            }
        } else {
            throw new InternalServerErrorException('order not found');
        }
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
                  statusId: dataQuery.orderStt,
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

    async imageUpload(file: Express.Multer.File, orderId: number, accId: number): Promise<boolean> {
        try {
            if (file) {
                const orderEntity = await this.orderRepository.findOne({
                    where: {
                        orderId: orderId,
                    },
                });

                if (orderEntity) {
                    const queryRunner = this.dataSource.createQueryRunner();
                    await queryRunner.connect();
                    await queryRunner.startTransaction();
                    try {
                        //update order
                        orderEntity.imageVerifyUrl = await this.googleDriveService.uploadImage(file);
                        const orderstatus = new OrderStatusEntity();
                        orderstatus.sttId = 9;
                        orderEntity.orderStt = 9;
                        orderEntity.status = orderstatus;
                        await this.orderRepository.update(orderId, orderEntity);
                        const checklog = await this.activityLogRepository.findOne({
                            where: { orderId: orderId, currentStatus: 9 },
                        });
                        if (checklog) {
                            checklog.time = new Date();
                            await queryRunner.manager.save(checklog);
                        } else {
                            //crate Activity Log
                            const activityLog = await this.ActivitylogOrder(orderEntity.orderId, 9, accId);
                            await queryRunner.manager.save(ActivityLogEntity, activityLog);
                        }
                        await queryRunner.commitTransaction();
                        return true;
                    } catch (error) {
                        await queryRunner.rollbackTransaction();
                        throw new InternalServerErrorException(error);
                    } finally {
                        await queryRunner.release();
                    }
                }

                return false;
            }
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
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
    async finishOrder(orderId: number) {
        const order = await this.orderRepository.findOneBy({ orderId: orderId });
        const orderStatus = new OrderStatusEntity();
        orderStatus.sttId = 9;
        order.status = orderStatus;
        await this.orderRepository.save(order);
    }
}
