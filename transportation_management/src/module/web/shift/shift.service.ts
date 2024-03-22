import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftSheetEntity } from '../../../entities/shift-sheet.entity';
import { StaffEntity } from '../../../entities/staff.entity';
import { UserLoginData } from '../../core/authentication/dto/user_login_data';
import { AccountEntity } from '../../../entities/account.entity';
import { ShiftCreateArrayDto } from './dto/shift.create.dto';
import * as moment from 'moment-timezone';
import { ShiftEntity } from '../../../entities/shift.entity';

@Injectable()
export class ShiftService {
    constructor(
        @InjectRepository(ShiftSheetEntity)
        private shiftSheetRepository: Repository<ShiftSheetEntity>,
        @InjectRepository(AccountEntity)
        private accountRepository: Repository<AccountEntity>,
    ) {}

    /**
     * Get shift detail.
     *
     * @param userLogin UserLoginData
     */
    async getShiftSheetDetail(userLogin: UserLoginData): Promise<ShiftSheetEntity[]> {
        try {
            const account = await this.accountRepository
                .createQueryBuilder('account')
                .innerJoinAndSelect('account.staffs', 'staffs')
                .where({ acc_id: userLogin.accId })
                .getOne();

            if (account) {
                const staff: StaffEntity = account.staffs[0];

                // TODO: Change shift timezone
                return await this.shiftSheetRepository.find({
                    relations: { shifts: true },
                    where: { staff: staff },
                });
            }

            return null;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * search Staff By Date.
     *
     * @param userLogin UserLoginData
     * @param from from
     * @param to to
     */
    async searchStaffByDate(userLogin: UserLoginData, from: string, to: string): Promise<ShiftSheetEntity[]> {
        try {
            const account = await this.accountRepository
                .createQueryBuilder('account')
                .innerJoinAndSelect('account.staffs', 'staffs')
                .where({ acc_id: userLogin.accId })
                .getOne();

            if (account) {
                const staff: StaffEntity = account.staffs[0];

                // TODO: Change shift timezone
                return await this.shiftSheetRepository
                    .createQueryBuilder('shiftSheet')
                    .innerJoinAndSelect('shiftSheet.shifts', 'shifts')
                    .where({ staff: staff })
                    .andWhere('shifts.day between :fromDate and :toDate', {
                        fromDate: moment(from),
                        toDate: moment(to),
                    })
                    .getMany();
            }

            return null;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }

    /**
     * create shift with staff.
     *
     * @param request ShiftCreateArrayDto
     */
    async createShift(request: ShiftCreateArrayDto): Promise<boolean> {
        try {
            const shiftSheets: ShiftSheetEntity[] = [];
            request.shiftDatas.forEach((element) => {
                const shiftSheet: ShiftSheetEntity = new ShiftSheetEntity();

                const shifts: ShiftEntity[] = [];
                element.shifts.forEach((element) => {
                    const shift = new ShiftEntity();
                    shift.shiftId = element.shiftId;
                    shift.day = element.day;
                    shift.shift = element.shift;
                    shifts.push(shift);
                });

                const staff: StaffEntity = new StaffEntity();
                staff.staff_id = element.staffId;
                shiftSheet.shifts = shifts;
                shiftSheet.staff = staff;

                shiftSheets.push(shiftSheet);
            });

            await this.shiftSheetRepository.save(shiftSheets);

            return true;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException();
        }
    }
}
