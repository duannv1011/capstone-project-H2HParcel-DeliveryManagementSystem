import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

@Injectable()
export class AppService {
    getHello(): any {

        return 'Hello DuanNV!:';
    }
}
