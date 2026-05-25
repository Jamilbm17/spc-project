import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { Enrollment } from './entities/enrollment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Enrollment])],
    providers: [EnrollmentsService],
    controllers: [EnrollmentsController],
    exports: [EnrollmentsService],
})
export class EnrollmentsModule { }
