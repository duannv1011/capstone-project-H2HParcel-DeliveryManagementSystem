import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

@Injectable()
export class AppService {
    getHello(): any {
        const a = dotenv.config({ path: process.cwd() + '/.env' });
        console.log(a);
        console.log(process.cwd() + '/.env');

        return { msg: 'Hello DuanNV!:', 'a:': a, 'process.cwd()': process.cwd() };
    }
}
