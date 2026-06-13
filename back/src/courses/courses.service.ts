import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Post } from './entities/post.entity';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { Question } from './entities/question.entity';
import { TaskSubmission } from './entities/task-submission.entity';
import { StudentAnswer } from './entities/student-answer.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Course)
        private readonly courseRepository: Repository<Course>,
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(CourseEnrollment)
        private readonly enrollmentRepository: Repository<CourseEnrollment>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(TaskSubmission)
        private readonly submissionRepository: Repository<TaskSubmission>,
        @InjectRepository(StudentAnswer)
        private readonly answerRepository: Repository<StudentAnswer>,
    ) {}

    // ── Courses ──────────────────────────────────────────────────────────────

    async createCourse(teacherId: number, dto: CreateCourseDto): Promise<Course> {
        const course = this.courseRepository.create({ ...dto, teacherId });
        return this.courseRepository.save(course);
    }

    async findAllCourses(query?: string): Promise<Course[]> {
        const qb = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.teacher', 'teacher')
            .where('course.isActive = :active', { active: true });

        if (query) {
            qb.andWhere('course.title LIKE :q OR course.description LIKE :q', { q: `%${query}%` });
        }

        return qb.orderBy('course.createdAt', 'DESC').getMany();
    }

    async findOneCourse(id: number): Promise<Course & { posts: Post[]; enrollmentCount: number }> {
        const course = await this.courseRepository.findOne({
            where: { id },
            relations: ['teacher'],
        });
        if (!course) throw new NotFoundException('Curso no encontrado');

        const posts = await this.postRepository.find({
            where: { courseId: id },
            order: { createdAt: 'DESC' },
        });

        const enrollmentCount = await this.enrollmentRepository.count({ where: { courseId: id } });

        return { ...course, posts, enrollmentCount };
    }

    async updateCourse(id: number, dto: UpdateCourseDto): Promise<Course> {
        const course = await this.courseRepository.findOne({ where: { id } });
        if (!course) throw new NotFoundException('Curso no encontrado');
        Object.assign(course, dto);
        return this.courseRepository.save(course);
    }

    async removeCourse(id: number): Promise<void> {
        const course = await this.courseRepository.findOne({ where: { id } });
        if (!course) throw new NotFoundException('Curso no encontrado');
        await this.courseRepository.remove(course);
    }

    // ── Posts (curso) ─────────────────────────────────────────────────────────

    async createPost(courseId: number, dto: CreatePostDto): Promise<Post> {
        const course = await this.courseRepository.findOne({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Curso no encontrado');
        const post = this.postRepository.create({ ...dto, courseId });
        return this.postRepository.save(post);
    }

    async findPostsByCourse(courseId: number): Promise<Post[]> {
        return this.postRepository.find({
            where: { courseId },
            order: { createdAt: 'DESC' },
        });
    }

    // ── Posts (actividad) ─────────────────────────────────────────────────────

    async createPostForActivity(activityId: number, dto: CreatePostDto): Promise<Post> {
        const post = this.postRepository.create({ ...dto, activityId });
        return this.postRepository.save(post);
    }

    async findPostsByActivity(activityId: number): Promise<Post[]> {
        return this.postRepository.find({
            where: { activityId },
            order: { createdAt: 'ASC' },
        });
    }

    // ── Posts (común) ─────────────────────────────────────────────────────────

    async findPostWithQuestions(postId: number): Promise<Post & { questions: Question[] }> {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) throw new NotFoundException('Tarea no encontrada');
        const questions = await this.questionRepository.find({
            where: { postId },
            order: { order: 'ASC', id: 'ASC' },
        });
        return { ...post, questions };
    }

    async updatePost(postId: number, dto: UpdatePostDto): Promise<Post> {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) throw new NotFoundException('Publicación no encontrada');
        Object.assign(post, dto);
        return this.postRepository.save(post);
    }

    async removePost(postId: number): Promise<void> {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) throw new NotFoundException('Publicación no encontrada');
        await this.postRepository.remove(post);
    }

    // ── Questions ─────────────────────────────────────────────────────────────

    async createQuestion(postId: number, dto: CreateQuestionDto): Promise<Question> {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) throw new NotFoundException('Tarea no encontrada');
        const question = this.questionRepository.create({
            ...dto,
            postId,
            options: dto.options ?? null,
            correctOptionIndex: dto.correctOptionIndex ?? null,
            points: dto.points ?? null,
            order: dto.order ?? 0,
        });
        return this.questionRepository.save(question);
    }

    async updateQuestion(questionId: number, dto: Partial<CreateQuestionDto>): Promise<Question> {
        const question = await this.questionRepository.findOne({ where: { id: questionId } });
        if (!question) throw new NotFoundException('Pregunta no encontrada');
        Object.assign(question, dto);
        return this.questionRepository.save(question);
    }

    async removeQuestion(questionId: number): Promise<void> {
        const question = await this.questionRepository.findOne({ where: { id: questionId } });
        if (!question) throw new NotFoundException('Pregunta no encontrada');
        await this.questionRepository.remove(question);
    }

    async findQuestionsByPost(postId: number): Promise<Question[]> {
        return this.questionRepository.find({
            where: { postId },
            order: { order: 'ASC', id: 'ASC' },
        });
    }

    // ── Submissions ───────────────────────────────────────────────────────────

    async submitTask(postId: number, studentId: number, dto: SubmitTaskDto): Promise<TaskSubmission> {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) throw new NotFoundException('Tarea no encontrada');
        const submission = await this.upsertSubmission(postId, studentId);
        if (dto.answers.length > 0) {
            const entities = dto.answers.map((a) =>
                this.answerRepository.create({
                    submissionId: submission.id,
                    questionId: a.questionId,
                    textAnswer: a.textAnswer ?? null,
                    selectedOption: a.selectedOption ?? null,
                }),
            );
            await this.answerRepository.save(entities);
        }
        await this.autoGrade(submission, postId, post.maxScore, dto.answers);
        return this.submissionRepository.findOne({
            where: { id: submission.id },
            relations: ['answers', 'answers.question'],
        });
    }

    private async upsertSubmission(postId: number, studentId: number): Promise<TaskSubmission> {
        const existing = await this.submissionRepository.findOne({ where: { postId, studentId } });
        if (existing) {
            await this.answerRepository.delete({ submissionId: existing.id });
            return existing;
        }
        const created = this.submissionRepository.create({ postId, studentId, score: null, teacherComment: null });
        return this.submissionRepository.save(created);
    }

    private async autoGrade(
        submission: TaskSubmission,
        postId: number,
        maxScore: number | null,
        answers: SubmitTaskDto['answers'],
    ): Promise<void> {
        const questions = await this.questionRepository.find({ where: { postId } });
        const mcQuestions = questions.filter((q) => q.type === 'MULTIPLE_CHOICE' && q.correctOptionIndex !== null);
        if (mcQuestions.length === 0) return;
        const withPoints = mcQuestions.filter((q) => q.points != null);
        if (withPoints.length > 0) {
            const earned = withPoints.reduce((sum, q) => {
                const ans = answers.find((a) => a.questionId === q.id);
                return ans?.selectedOption === q.correctOptionIndex ? sum + (q.points ?? 0) : sum;
            }, 0);
            submission.score = Math.round(earned * 10) / 10;
            await this.submissionRepository.save(submission);
            return;
        }
        if (maxScore) {
            const correct = mcQuestions.filter((q) => answers.find((a) => a.questionId === q.id)?.selectedOption === q.correctOptionIndex).length;
            submission.score = Math.round((correct / mcQuestions.length) * maxScore * 10) / 10;
            await this.submissionRepository.save(submission);
        }
    }

    async getMySubmission(postId: number, studentId: number): Promise<TaskSubmission | null> {
        return this.submissionRepository.findOne({
            where: { postId, studentId },
            relations: ['answers', 'answers.question'],
        });
    }

    async getSubmissions(postId: number): Promise<TaskSubmission[]> {
        return this.submissionRepository.find({
            where: { postId },
            relations: ['student', 'answers', 'answers.question'],
            order: { submittedAt: 'DESC' },
        });
    }

    async gradeSubmission(submissionId: number, dto: GradeSubmissionDto): Promise<TaskSubmission> {
        const submission = await this.submissionRepository.findOne({ where: { id: submissionId } });
        if (!submission) throw new NotFoundException('Entrega no encontrada');
        Object.assign(submission, dto);
        return this.submissionRepository.save(submission);
    }

    // ── Student Enrollments ───────────────────────────────────────────────────

    async enrollStudent(studentId: number, courseId: number): Promise<CourseEnrollment> {
        const course = await this.courseRepository.findOne({ where: { id: courseId, isActive: true } });
        if (!course) throw new NotFoundException('Curso no encontrado o inactivo');

        const existing = await this.enrollmentRepository.findOne({ where: { studentId, courseId } });
        if (existing) throw new ConflictException('Ya estás inscrito en este curso');

        const enrollment = this.enrollmentRepository.create({ studentId, courseId });
        return this.enrollmentRepository.save(enrollment);
    }

    async unenrollStudent(studentId: number, courseId: number): Promise<void> {
        const enrollment = await this.enrollmentRepository.findOne({ where: { studentId, courseId } });
        if (!enrollment) throw new NotFoundException('No estás inscrito en este curso');
        await this.enrollmentRepository.remove(enrollment);
    }

    async findMyCourses(studentId: number): Promise<(Course & { posts: Post[] })[]> {
        const enrollments = await this.enrollmentRepository.find({
            where: { studentId },
            relations: ['course', 'course.teacher'],
            order: { enrolledAt: 'DESC' },
        });

        return Promise.all(
            enrollments.map(async (e) => {
                const posts = await this.postRepository.find({
                    where: { courseId: e.courseId },
                    order: { createdAt: 'DESC' },
                });
                return { ...e.course, posts };
            }),
        );
    }

    async checkEnrollment(studentId: number, courseId: number): Promise<{ enrolled: boolean }> {
        const enrollment = await this.enrollmentRepository.findOne({ where: { studentId, courseId } });
        return { enrolled: !!enrollment };
    }

    async findEnrollmentsByCourse(courseId: number): Promise<CourseEnrollment[]> {
        return this.enrollmentRepository.find({
            where: { courseId },
            relations: ['student'],
            order: { enrolledAt: 'DESC' },
        });
    }

    async findAllCoursesAdmin(query?: string): Promise<(Course & { enrollmentCount: number })[]> {
        const qb = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.teacher', 'teacher');

        if (query) {
            qb.where('course.title LIKE :q OR course.description LIKE :q', { q: `%${query}%` });
        }

        const courses = await qb.orderBy('course.createdAt', 'DESC').getMany();

        return Promise.all(
            courses.map(async (c) => {
                const enrollmentCount = await this.enrollmentRepository.count({ where: { courseId: c.id } });
                return { ...c, enrollmentCount };
            }),
        );
    }
}
