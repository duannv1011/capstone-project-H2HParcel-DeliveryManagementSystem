import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/entities/customer.entity';
import { OrderEntity } from 'src/entities/order.entity';
import { Repository } from 'typeorm';
import { CusCreateOrderDto } from '../dto/customer_create_order.dto';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>,
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
            .leftJoinAndSelect('o.packe_type', 'op')
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

    async createOrder(data: CusCreateOrderDto, acc_id: number): Promise<any> {
        return null;
    }
}
