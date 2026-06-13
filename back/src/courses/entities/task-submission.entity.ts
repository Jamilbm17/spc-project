import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { StudentAnswer } from './student-answer.entity';
import { Student } from '../../students/entities/student.entity';

@Entity('task_submissions')
@Unique(['postId', 'studentId'])
export class TaskSubmission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    postId: number;

    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: Post;

    @Column()
    studentId: number;

    @ManyToOne(() => Student, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'studentId' })
    student: Student;

    @CreateDateColumn()
    submittedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'float', nullable: true })
    score: number | null;

    @Column({ type: 'text', nullable: true })
    teacherComment: string | null;

    @OneToMany(() => StudentAnswer, (a) => a.submission, { cascade: true, eager: true })
    answers: StudentAnswer[];
}
