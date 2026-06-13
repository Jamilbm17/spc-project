import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskSubmission } from './task-submission.entity';
import { Question } from './question.entity';

@Entity('student_answers')
export class StudentAnswer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    submissionId: number;

    @ManyToOne(() => TaskSubmission, (s) => s.answers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'submissionId' })
    submission: TaskSubmission;

    @Column()
    questionId: number;

    @ManyToOne(() => Question, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'questionId' })
    question: Question;

    @Column({ type: 'text', nullable: true })
    textAnswer: string | null;

    @Column({ nullable: true })
    selectedOption: number | null;
}
