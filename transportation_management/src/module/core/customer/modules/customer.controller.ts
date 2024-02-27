import { Body, Controller, Post } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ApiTags } from '@nestjs/swagger';
import { DetailCustommerDto } from '../dto/get_detail_customer_dto';

@ApiTags('customer-api')
@Controller('customer')
export class CustomerController {
    constructor(private customerService: CustomerService) {}
    @Post('detailCustomer')
    register(@Body() data: DetailCustommerDto): Promise<any> {
        return this.customerService.getInforAccount(Number(data.id), Number(data.role_id));
    }
}
