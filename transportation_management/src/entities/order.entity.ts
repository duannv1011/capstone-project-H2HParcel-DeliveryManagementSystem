import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { InformationEntity } from './information.entity';
import { StaffEntity } from './staff.entity';
import { OrderStatusEntity } from './order-status.entity';
import { PackageTypeEntity } from './package-type.entity';

@Entity('Order')
export class OrderEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'order_id' })
    public orderId: number;

    @Column({ name: 'cus_id' })
    public cusId: number;

    @Column({ name: 'pickup_infor_id' })
    public pickupInforId: number;

    @Column({ name: 'pickup_shipper', nullable: true })
    public pickupShipper: number;

    @Column({ name: 'deliver_infor_id' })
    public deliverInforId: number;

    @Column({ name: 'deliver_shipper', nullable: true })
    public deliverShipper: number;

    @Column({ name: 'order_stt' })
    public orderStt: number;

    @Column({ name: 'pk_id' })
    public pkId: number;

    @Column({ name: 'estimated_price' })
    public estimatedPrice: number;

    @ManyToOne(() => InformationEntity, { eager: true })
    @JoinColumn({ name: 'pickup_infor_id' })
    pickupInformation: InformationEntity;

    @ManyToOne(() => StaffEntity, { eager: true })
    @JoinColumn({ name: 'pickup_shipper' })
    pickupShipperStaff: StaffEntity;

    @ManyToOne(() => StaffEntity, { eager: true })
    @JoinColumn({ name: 'deliver_shipper' })
    deliverShipperStaff: StaffEntity;

    @ManyToOne(() => InformationEntity, { eager: true })
    @JoinColumn({ name: 'deliver_infor_id' })
    deliverInformation: InformationEntity;

    @ManyToOne(() => OrderStatusEntity, { eager: true })
    @JoinColumn({ name: 'order_stt' })
    status: OrderStatusEntity;

    @ManyToOne(() => PackageTypeEntity, { eager: true })
    @JoinColumn({ name: 'pk_id' })
    packageType: PackageTypeEntity;
}
