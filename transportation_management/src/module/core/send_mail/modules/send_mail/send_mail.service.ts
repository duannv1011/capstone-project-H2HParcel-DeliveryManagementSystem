import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { Repository } from 'typeorm';
import { StaffEntity } from 'src/entities/staff.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import * as bcrypt from 'bcrypt';
import { sendEmailDto } from '../../dto/reset_pass_send_mail_dto';
import { ResetPasswordDto } from '../../dto/reset_pass_update_dto';
import { JwtService } from '@nestjs/jwt';

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
        private jwtService: JwtService,
    ) {}

    async sendPasswordResetEmail(email: sendEmailDto): Promise<any> {
        try {
            const verifyCode = await this.genareatecode();
            const checkstaff = await this.staffRespository.findOne({ where: { email: email.email } });
            const checkscus = await this.customerRepository.findOne({ where: { email: email.email } });
            if (!checkstaff && !checkscus) {
                return 'not found';
            }
            //const accId = checkstaff ? checkstaff.accId : checkscus.accId;

            await this.mailerService.sendMail({
                to: email.email,
                from: this.configService.get<string>('DEFAULT_EMAIL_FROM'),
                subject: 'H2H App Password Reset',
                template: 'src/teamplates/email/reset_pass',
                html: `<p>We received a request to reset your password. Please qick to respon the verify code . This code will effect in 10 minute:</p>
                <H3>${verifyCode}<H3>
                <p>If you did not request a password reset, you can ignore this email.</p>`,
            });
            // const payload = { id: accId, email: email.email, verify_code: verifyCode };
            // const token = await this.genarateToken(payload);
            return { code: 200, msg: 'success', email: email, verifyCode: verifyCode };
        } catch (error) {
            console.log(error);
            return 'eror';
        }
    }
    async updatePassword(request: ResetPasswordDto) {
        const resetPass = request.password;
        const saltTime = await bcrypt.genSalt(10);
        const hashpasswords = await bcrypt.hash(resetPass, saltTime);
        const checkscus = await this.customerRepository.findOne({ where: { email: request.email } });
        const checkstaff = await this.staffRespository.findOne({ where: { email: request.email } });
        const accId = checkstaff ? checkstaff.accId : checkscus.accId;

        console.log(accId);
        const updateAccount = await this.accountRepository.update({ accId: accId }, { password: hashpasswords });
        if (!updateAccount) {
            return { code: 200, msg: 'update failed' };
        }
        return 'update successful';
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
    private async genarateToken(payload: { id: number; email: string; verify_code: string }) {
        const access_token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('VERIFICATION_CODE_SECRET'),
            expiresIn: this.configService.get<string>('10p'),
        });
        return { access_token };
    }
    private verifyVerificationCode(verificationCode: string, userVerificationCode: string): boolean {
        try {
            this.jwtService.verify(verificationCode, {
                secret: this.configService.get<string>('VERIFICATION_CODE_SECRET'),
            });
            return verificationCode === userVerificationCode;
        } catch (error) {
            return false;
        }
    }
}
