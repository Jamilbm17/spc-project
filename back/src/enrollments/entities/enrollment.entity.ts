import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Activity } from '../../activities/entities/activity.entity';

export enum EnrollmentStatusEnum {
    ENROLLED = 'ENROLLED',
    CANCELLED = 'CANCELLED',
}

@Entity('enrollments')
@Unique(['studentId', 'activityId'])
export class Enrollment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    studentId: number;

    @ManyToOne(() => Student, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'studentId' })
    student: Student;

    @Column()
    activityId: number;

    @ManyToOne(() => Activity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'activityId' })
    activity: Activity;

    @Column({ type: 'text', default: EnrollmentStatusEnum.ENROLLED })
    status: EnrollmentStatusEnum;

    @CreateDateColumn()
    enrolledAt: Date;
}
