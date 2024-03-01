import { AccountEntity } from 'src/module/core/authentication/entity/account';
import { AddressEntity } from 'src/module/core/authentication/entity/address';
import { StaffEntity } from 'src/module/core/authentication/entity/staff';
import { CustomerEntity } from 'src/module/core/customer/entity/customer';
import { RoleEntity } from 'src/module/web/role/entity/role';
import { DataSource } from 'typeorm';

export const PostgresDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgresql',
    password: 'pw67CFujuYyqHXhwrDTYe6NeAdPkmhjC',
    database: 'postgres',
    entities: [AccountEntity, AddressEntity, RoleEntity, CustomerEntity, StaffEntity],
    synchronize: true,
    schema: 'transportation_management',
});

PostgresDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((err) => {
        console.error('Error during Data Source initialization', err);
    });
