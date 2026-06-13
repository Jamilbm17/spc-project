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
import { Course } from './course.entity';

@Entity('course_enrollments')
@Unique(['studentId', 'courseId'])
export class CourseEnrollment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    studentId: number;

    @ManyToOne(() => Student, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'studentId' })
    student: Student;

    @Column()
    courseId: number;

    @ManyToOne(() => Course, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'courseId' })
    course: Course;

    @CreateDateColumn()
    enrolledAt: Date;
}
