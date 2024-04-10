import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('Hello')
    getHello(): string {
        console.log(process.env.GOOGLE_DRIVER_EVIDENCE_FOLDER_ID);
        console.log(process.cwd() + '/env');
        return this.appService.getHello();
    }
}
