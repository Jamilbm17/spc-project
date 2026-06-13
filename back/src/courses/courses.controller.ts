import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
    Request,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { StudentGuard } from '../auth/guards/student.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    // ── Admin: Courses CRUD ───────────────────────────────────────────────────

    @Post()
    @UseGuards(AdminGuard)
    createCourse(@Request() req, @Body() dto: CreateCourseDto) {
        return this.coursesService.createCourse(req.user.sub, dto);
    }

    @Get('admin')
    @UseGuards(AdminGuard)
    findAllAdmin(@Query('query') query?: string) {
        return this.coursesService.findAllCoursesAdmin(query);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    updateCourse(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseDto) {
        return this.coursesService.updateCourse(id, dto);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    removeCourse(@Param('id', ParseIntPipe) id: number) {
        return this.coursesService.removeCourse(id);
    }

    // ── Admin: Posts de cursos ────────────────────────────────────────────────

    @Post(':id/posts')
    @UseGuards(AdminGuard)
    createPost(@Param('id', ParseIntPipe) courseId: number, @Body() dto: CreatePostDto) {
        return this.coursesService.createPost(courseId, dto);
    }

    @Put('posts/:postId')
    @UseGuards(AdminGuard)
    updatePost(@Param('postId', ParseIntPipe) postId: number, @Body() dto: UpdatePostDto) {
        return this.coursesService.updatePost(postId, dto);
    }

    @Delete(':id/posts/:postId')
    @UseGuards(AdminGuard)
    removePost(@Param('postId', ParseIntPipe) postId: number) {
        return this.coursesService.removePost(postId);
    }

    // ── Admin: Posts de actividades ───────────────────────────────────────────

    @Post('activity-tasks/:activityId')
    @UseGuards(AdminGuard)
    createActivityPost(
        @Param('activityId', ParseIntPipe) activityId: number,
        @Body() dto: CreatePostDto,
    ) {
        return this.coursesService.createPostForActivity(activityId, dto);
    }

    @Get('activity-tasks/:activityId')
    @UseGuards(JwtAuthGuard)
    findActivityPosts(@Param('activityId', ParseIntPipe) activityId: number) {
        return this.coursesService.findPostsByActivity(activityId);
    }

    // ── Admin: Gestión de preguntas ───────────────────────────────────────────

    @Post('posts/:postId/questions')
    @UseGuards(AdminGuard)
    createQuestion(
        @Param('postId', ParseIntPipe) postId: number,
        @Body() dto: CreateQuestionDto,
    ) {
        return this.coursesService.createQuestion(postId, dto);
    }

    @Put('questions/:questionId')
    @UseGuards(AdminGuard)
    updateQuestion(
        @Param('questionId', ParseIntPipe) questionId: number,
        @Body() dto: CreateQuestionDto,
    ) {
        return this.coursesService.updateQuestion(questionId, dto);
    }

    @Delete('questions/:questionId')
    @UseGuards(AdminGuard)
    removeQuestion(@Param('questionId', ParseIntPipe) questionId: number) {
        return this.coursesService.removeQuestion(questionId);
    }

    // ── Admin: Ver y calificar entregas ───────────────────────────────────────

    @Get('posts/:postId/submissions')
    @UseGuards(AdminGuard)
    getSubmissions(@Param('postId', ParseIntPipe) postId: number) {
        return this.coursesService.getSubmissions(postId);
    }

    @Put('submissions/:id/grade')
    @UseGuards(AdminGuard)
    gradeSubmission(
        @Param('id', ParseIntPipe) submissionId: number,
        @Body() dto: GradeSubmissionDto,
    ) {
        return this.coursesService.gradeSubmission(submissionId, dto);
    }

    // ── Admin: Enrollments ────────────────────────────────────────────────────

    @Get(':id/students')
    @UseGuards(AdminGuard)
    findEnrollmentsByCourse(@Param('id', ParseIntPipe) courseId: number) {
        return this.coursesService.findEnrollmentsByCourse(courseId);
    }

    // ── Student + Admin: Post detalle con preguntas ───────────────────────────

    @Get('posts/:postId')
    @UseGuards(JwtAuthGuard)
    findPostWithQuestions(@Param('postId', ParseIntPipe) postId: number) {
        return this.coursesService.findPostWithQuestions(postId);
    }

    // ── Student: Entregas de tareas ───────────────────────────────────────────

    @Post('posts/:postId/submit')
    @UseGuards(StudentGuard)
    submitTask(
        @Request() req,
        @Param('postId', ParseIntPipe) postId: number,
        @Body() dto: SubmitTaskDto,
    ) {
        return this.coursesService.submitTask(postId, req.user.sub, dto);
    }

    @Get('posts/:postId/my-submission')
    @UseGuards(StudentGuard)
    getMySubmission(@Request() req, @Param('postId', ParseIntPipe) postId: number) {
        return this.coursesService.getMySubmission(postId, req.user.sub);
    }

    // ── Student: Browse & Enroll ──────────────────────────────────────────────

    @Get()
    @UseGuards(StudentGuard)
    findAll(@Query('query') query?: string) {
        return this.coursesService.findAllCourses(query);
    }

    @Get('my')
    @UseGuards(StudentGuard)
    findMyCourses(@Request() req) {
        return this.coursesService.findMyCourses(req.user.sub);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.coursesService.findOneCourse(id);
    }

    @Get(':id/posts')
    @UseGuards(StudentGuard)
    findPostsByCourse(@Param('id', ParseIntPipe) courseId: number) {
        return this.coursesService.findPostsByCourse(courseId);
    }

    @Get(':id/check-enrollment')
    @UseGuards(StudentGuard)
    checkEnrollment(@Request() req, @Param('id', ParseIntPipe) courseId: number) {
        return this.coursesService.checkEnrollment(req.user.sub, courseId);
    }

    @Post(':id/enroll')
    @UseGuards(StudentGuard)
    enroll(@Request() req, @Param('id', ParseIntPipe) courseId: number) {
        return this.coursesService.enrollStudent(req.user.sub, courseId);
    }

    @Delete(':id/unenroll')
    @UseGuards(StudentGuard)
    unenroll(@Request() req, @Param('id', ParseIntPipe) courseId: number) {
        return this.coursesService.unenrollStudent(req.user.sub, courseId);
    }
}
