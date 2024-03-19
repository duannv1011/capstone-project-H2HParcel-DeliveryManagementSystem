import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ResetPasswordDto } from '../../dto/reset_pass_send_mail_dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { Repository } from 'typeorm';
import { StaffEntity } from 'src/entities/staff.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SendMailService {
    constructor(
        @InjectRepository(AccountEntity)
        private readonly accountRepository: Repository<AccountEntity>,
        @InjectRepository(StaffEntity)
        private readonly staffRespository: Repository<StaffEntity>,
        @InjectRepository(CustomerEntity)
        private readonly customerRepository: Repository<CustomerEntity>,
        private readonly mailerService: MailerService,
        private configService: ConfigService,
    ) {}

    async sendPasswordResetEmail(email: ResetPasswordDto): Promise<any> {
        try {
            const verifyCode = await this.genareatecode();
            const checkstaff = await this.staffRespository.findOne({ where: { email: email.email } });
            const checkscus = await this.customerRepository.findOne({ where: { email: email.email } });
            if (!checkstaff && !checkscus) {
                return 'not found';
            }
            await this.mailerService.sendMail({
                to: email.email,
                from: this.configService.get<string>('DEFAULT_EMAIL_FROM'),
                subject: 'H2H App Password Reset',
                template: 'src/teamplates/email/reset_pass',
                html: `<p>We received a request to reset your password. Please click the following link to reset it:</p>
                <H3>${verifyCode}<H3>
                <p>If you did not request a password reset, you can ignore this email.</p>`,
            });
            return 'successfull';
        } catch (error) {
            console.log(error);
            return 'eror';
        }
    }
    async updatePassword() {
        // const resetPass = this.genareatePassword();
        // const saltTime = await bcrypt.genSalt(10);
        // const hashpasswords = await bcrypt.hash(resetPass, saltTime);
        //const id = checkstaff.acc_id || checkscus.acc_id;
        //const updateAccount = await this.accountRepository.update(id, { password: hashpasswords });
        //if (!updateAccount) {
        //return 'update failed';
        //}
    }
    private genareatecode(): string {
        const numbers = '0123456789';
        let leter = this.getRandomChar(numbers);
        for (let i = 1; i < 6; i++) {
            leter += this.getRandomChar(numbers);
        }
        return leter;
    }
    private getRandomChar(char: string): string {
        const characters = char;
        const randomIndex = Math.floor(Math.random() * characters.length);
        return characters[randomIndex];
    }
}
