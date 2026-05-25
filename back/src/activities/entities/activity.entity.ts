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
import { Topic } from '../../topics/entities/topic.entity';

export enum ActivityStatusEnum {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

@Entity('activities')
export class Activity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    date: string;

    @Column({ nullable: true })
    startTime: string;

    @Column({ nullable: true })
    endTime: string;

    @Column({ nullable: true })
    location: string;

    @Column({
        type: 'text',
        default: ActivityStatusEnum.SCHEDULED,
    })
    status: ActivityStatusEnum;

    @Column({ nullable: true })
    expectedParticipants: number;

    @ManyToOne(() => Institution, { nullable: true, eager: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'institutionId' })
    institution: Institution;

    @Column({ nullable: true })
    institutionId: number;

    @ManyToOne(() => Topic, { nullable: true, eager: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'topicId' })
    topic: Topic;

    @Column({ nullable: true })
    topicId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
