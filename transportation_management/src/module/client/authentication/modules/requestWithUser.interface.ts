import { Request } from 'express';
import { AccountEntity } from 'src/entities/account.entity/account.entity';

interface RequestWithUser extends Request {
    account: AccountEntity;
}

export default RequestWithUser;
