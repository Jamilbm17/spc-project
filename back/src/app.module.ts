import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthModule } from './auth/auth.module';
import { ActivitiesModule } from './activities/activities.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { ParticipantsModule } from './participants/participants.module';
import { TopicsModule } from './topics/topics.module';
import { StudentsModule } from './students/students.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { SeedModule } from './seed/seed.module';
import { CoursesModule } from './courses/courses.module';
import { UploadModule } from './upload/upload.module';

import { User } from './auth/entities/user.entity';
import { Activity } from './activities/entities/activity.entity';
import { Institution } from './institutions/entities/institution.entity';
import { Participant } from './participants/entities/participant.entity';
import { Topic } from './topics/entities/topic.entity';
import { Student } from './students/entities/student.entity';
import { Enrollment } from './enrollments/entities/enrollment.entity';
import { Course } from './courses/entities/course.entity';
import { Post } from './courses/entities/post.entity';
import { CourseEnrollment } from './courses/entities/course-enrollment.entity';
import { Question } from './courses/entities/question.entity';
import { TaskSubmission } from './courses/entities/task-submission.entity';
import { StudentAnswer } from './courses/entities/student-answer.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'spc_database.sqlite',
            entities: [User, Activity, Institution, Participant, Topic, Student, Enrollment, Course, Post, CourseEnrollment, Question, TaskSubmission, StudentAnswer],
            synchronize: true,
            logging: false,
        }),
        PassportModule,
        JwtModule.register({
            secret: 'spc-secret-key-2024',
            signOptions: { expiresIn: '24h' },
            global: true,
        }),
        AuthModule,
        ActivitiesModule,
        InstitutionsModule,
        ParticipantsModule,
        TopicsModule,
        StudentsModule,
        EnrollmentsModule,
        CoursesModule,
        UploadModule,
        SeedModule,
    ],
})
export class AppModule { }
