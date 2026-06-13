import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { Post } from './entities/post.entity';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { Question } from './entities/question.entity';
import { TaskSubmission } from './entities/task-submission.entity';
import { StudentAnswer } from './entities/student-answer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Course, Post, CourseEnrollment, Question, TaskSubmission, StudentAnswer])],
    controllers: [CoursesController],
    providers: [CoursesService],
})
export class CoursesModule {}
