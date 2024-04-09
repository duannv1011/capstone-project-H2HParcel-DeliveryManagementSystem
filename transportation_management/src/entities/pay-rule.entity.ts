import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PayRule')
export class PriceMultiplierEntity {
    @PrimaryGeneratedColumn({ name: 'rule_id' })
    ruleId: number;

    @Column({ name: 'rule_id' })
    rule_id: number;

    @Column({ name: 'pay_rule_name' })
    payRuleName: number;
}
