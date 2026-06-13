import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Activity } from '../../activities/entities/activity.entity';

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    courseId: number;

    @ManyToOne(() => Course, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'courseId' })
    course: Course;

    @Column({ nullable: true })
    activityId: number;

    @ManyToOne(() => Activity, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'activityId' })
    activity: Activity;

    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ type: 'date', nullable: true })
    dueDate: string | null;

    @Column({ type: 'float', nullable: true })
    maxScore: number | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
