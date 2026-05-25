import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Institution } from '../../institutions/entities/institution.entity';

@Entity('participants')
export class Participant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    documentNumber: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    age: number;

    @ManyToOne(() => Institution, { nullable: true, eager: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'institutionId' })
    institution: Institution;

    @Column({ nullable: true })
    institutionId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
