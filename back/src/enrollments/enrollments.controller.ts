import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Req,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { StudentGuard } from '../auth/guards/student.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('enrollments')
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) { }

    // Student: enroll in a class
    @UseGuards(StudentGuard)
    @Post()
    enroll(@Req() req: Request, @Body() dto: CreateEnrollmentDto) {
        const studentId = (req as any).user.sub;
        return this.enrollmentsService.enroll(studentId, dto);
    }

    // Student: cancel enrollment
    @UseGuards(StudentGuard)
    @Delete(':id')
    cancel(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
        const studentId = (req as any).user.sub;
        return this.enrollmentsService.cancel(studentId, id);
    }

    // Student: get my enrollments
    @UseGuards(StudentGuard)
    @Get('my')
    findMy(@Req() req: Request) {
        const studentId = (req as any).user.sub;
        return this.enrollmentsService.findByStudent(studentId);
    }

    // Student: check if enrolled in an activity
    @UseGuards(StudentGuard)
    @Get('check/:activityId')
    checkEnrollment(
        @Req() req: Request,
        @Param('activityId', ParseIntPipe) activityId: number,
    ) {
        const studentId = (req as any).user.sub;
        return this.enrollmentsService.checkEnrollment(studentId, activityId);
    }

    // Admin: get enrollments for a specific activity
    @UseGuards(AdminGuard)
    @Get('activity/:activityId')
    findByActivity(@Param('activityId', ParseIntPipe) activityId: number) {
        return this.enrollmentsService.findByActivity(activityId);
    }
}
