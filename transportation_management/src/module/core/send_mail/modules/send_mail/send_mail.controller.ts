import { Body, Controller, Post } from '@nestjs/common';
import { SendMailService } from './send_mail.service';
import { ApiTags } from '@nestjs/swagger';
import { ResetPasswordDto } from '../../dto/reset_pass_send_mail_dto';

@Controller('send-mail')
@ApiTags('send-mail')
export class SendMailController {
    constructor(private readonly emailService: SendMailService) {}
    @Post('reset-password')
    async sendPasswordResetEmail(@Body() email: ResetPasswordDto): Promise<any> {
        const send_status = await this.emailService.sendPasswordResetEmail(email);
        return send_status;
    }
}
