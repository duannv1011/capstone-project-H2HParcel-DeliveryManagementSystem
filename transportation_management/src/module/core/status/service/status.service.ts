import { Injectable } from '@nestjs/common';
@Injectable()
export class StatusService {
    async getAllCustomerStatus(): Promise<any> {
        const statusData = [
            { stt_id: 1, statusName: 'Acitve' },
            { stt_id: 2, statusName: 'Suspended' },
            { stt_id: 3, statusName: 'Inactive' },
        ];
        return statusData;
    }
    async getAllStaffStatus() {
        const statusData = [
            { stt_id: 1, statusName: 'Acitve' },
            { stt_id: 2, statusName: 'Suspended' },
            { stt_id: 3, statusName: 'Inactive' },
        ];
        return statusData;
    }
}
