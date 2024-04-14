import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PayRule')
export class PayRuleEntity {
    @PrimaryGeneratedColumn({ name: 'rule_id' })
    ruleId: number;

    @Column({ name: 'effort' })
    effort: number;

    @Column({ name: 'pay_rule_name', nullable: true })
    payRuleName: number;
}
