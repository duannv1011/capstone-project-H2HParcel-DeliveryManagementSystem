import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/entities/customer.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { CusCreateOrderDto } from '../dto/customer_create_order.dto';
import { InformationEntity } from 'src/entities/Information.entity';
import { AddressEntity } from 'src/entities/address.entity';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
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
            pick_shiper: item.pickup_shipper_staff,
            deliver_name: item.deliver_information.name,
            deliver_phone: item.deliver_information.phone,
            deliver_city: item.deliver_information.address.city.city_name,
            deliver_district: item.deliver_information.address.district.district_name,
            deliver_ward: item.deliver_information.address.ward.ward_name,
            deliver_shiper: item.deliver_shipper_staff,
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
                  pick_shiper: dataQuery.pickup_shipper_staff,
                  deliver_name: dataQuery.deliver_information.name,
                  deliver_phone: dataQuery.deliver_information.phone,
                  deliver_city: dataQuery.deliver_information.address.city.city_name,
                  deliver_district: dataQuery.deliver_information.address.district.district_name,
                  deliver_ward: dataQuery.deliver_information.address.ward.ward_name,
                  deliver_shiper: dataQuery.deliver_shipper_staff,
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
        const checkPickupInfor = await this.informationRepository.findOne({
            where: { infor_id: data.pickup_infor_id ? data.pickup_infor_id : 0 },
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
}
