import { Body, Controller, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { SendMailService } from './send_mail.service';
import { ApiTags } from '@nestjs/swagger';
import { sendEmailDto } from '../../dto/reset_pass_send_mail_dto';
import { ResetPasswordDto } from '../../dto/reset_pass_update_dto';

@Controller('send-mail')
@ApiTags('send-mail')
export class SendMailController {
    constructor(private readonly emailService: SendMailService) {}
    @Post('send-verify-code')
    async sendPasswordResetEmail(@Body() email: sendEmailDto): Promise<any> {
        const send_status = await this.emailService.sendPasswordResetEmail(email);
        return send_status;
    }
    @Patch('reset-password')
    @UsePipes(ValidationPipe)
    async updatePassword(@Body() request: ResetPasswordDto): Promise<any> {
        const result = await this.emailService.updatePassword(request);
        return result;
    }
}
