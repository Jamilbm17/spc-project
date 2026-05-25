import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatusEnum } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
    constructor(
        @InjectRepository(Enrollment)
        private readonly enrollmentRepository: Repository<Enrollment>,
    ) { }

    async enroll(studentId: number, dto: CreateEnrollmentDto): Promise<Enrollment> {
        const existing = await this.enrollmentRepository.findOne({
            where: { studentId, activityId: dto.activityId },
        });

        if (existing) {
            if (existing.status === EnrollmentStatusEnum.ENROLLED) {
                throw new ConflictException('Ya estás inscrito en esta clase');
            }
            // Re-enroll if previously cancelled
            existing.status = EnrollmentStatusEnum.ENROLLED;
            return this.enrollmentRepository.save(existing);
        }

        const enrollment = this.enrollmentRepository.create({
            studentId,
            activityId: dto.activityId,
            status: EnrollmentStatusEnum.ENROLLED,
        });

        return this.enrollmentRepository.save(enrollment);
    }

    async cancel(studentId: number, enrollmentId: number): Promise<{ message: string }> {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { id: enrollmentId },
        });

        if (!enrollment) throw new NotFoundException('Inscripción no encontrada');
        if (enrollment.studentId !== studentId) {
            throw new ForbiddenException('No puedes cancelar una inscripción que no es tuya');
        }

        enrollment.status = EnrollmentStatusEnum.CANCELLED;
        await this.enrollmentRepository.save(enrollment);
        return { message: 'Inscripción cancelada' };
    }

    async findByStudent(studentId: number): Promise<Enrollment[]> {
        return this.enrollmentRepository.find({
            where: { studentId, status: EnrollmentStatusEnum.ENROLLED },
            relations: ['activity', 'activity.institution', 'activity.topic'],
            order: { enrolledAt: 'DESC' },
        });
    }

    async findByActivity(activityId: number): Promise<Enrollment[]> {
        return this.enrollmentRepository.find({
            where: { activityId, status: EnrollmentStatusEnum.ENROLLED },
            relations: ['student'],
            order: { enrolledAt: 'ASC' },
        });
    }

    async countByActivity(activityId: number): Promise<number> {
        return this.enrollmentRepository.count({
            where: { activityId, status: EnrollmentStatusEnum.ENROLLED },
        });
    }

    async checkEnrollment(
        studentId: number,
        activityId: number,
    ): Promise<{ enrolled: boolean; enrollmentId: number | null }> {
        const enrollment = await this.enrollmentRepository.findOne({
            where: { studentId, activityId, status: EnrollmentStatusEnum.ENROLLED },
        });
        return {
            enrolled: !!enrollment,
            enrollmentId: enrollment?.id ?? null,
        };
    }
}
