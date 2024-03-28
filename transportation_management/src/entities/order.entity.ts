import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { InformationEntity } from './Information.entity';
import { StaffEntity } from './staff.entity';
import { OrderStatusEntity } from './order-status.entity';
import { PackageTypeEntity } from './package-type.entity';

@Entity('Order')
export class OrderEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'order_id' })
    public order_id: number;

    @Column({ name: 'cus_id' })
    public cus_id: number;

    @Column({ name: 'pickup_infor_id' })
    public pickup_infor_id: number;

    @Column({ name: 'pickup_shipper', nullable: true })
    public pickup_shipper: number;

    @Column({ name: 'deliver_infor_id' })
    public deliver_infor_id: number;

    @Column({ name: 'deliver_shipper', nullable: true })
    public deliver_shipper: number;

    @Column({ name: 'order_stt' })
    public order_stt: number;

    @Column({ name: 'pk_id' })
    public pk_id: number;

    @Column({ name: 'estimated_price' })
    public estimated_price: number;

    @ManyToOne(() => InformationEntity, { eager: true })
    @JoinColumn({ name: 'pickup_infor_id' })
    pickup_information: InformationEntity;

    @ManyToOne(() => StaffEntity, { eager: true })
    @JoinColumn({ name: 'pickup_shipper' })
    pickup_shipper_staff: StaffEntity;

    @ManyToOne(() => StaffEntity, { eager: true })
    @JoinColumn({ name: 'deliver_shipper' })
    deliver_shipper_staff: StaffEntity;

    @ManyToOne(() => InformationEntity, { eager: true })
    @JoinColumn({ name: 'deliver_infor_id' })
    deliver_information: InformationEntity;

    @ManyToOne(() => OrderStatusEntity, { eager: true })
    @JoinColumn({ name: 'order_stt' })
    status: OrderStatusEntity;

    @ManyToOne(() => PackageTypeEntity, { eager: true })
    @JoinColumn({ name: 'pk_id' })
    package_type: PackageTypeEntity;
}
