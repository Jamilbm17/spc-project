import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
    ) { }

    private baseQuery(): SelectQueryBuilder<Student> {
        return this.studentRepository
            .createQueryBuilder('student')
            .select([
                'student.id',
                'student.firstName',
                'student.lastName',
                'student.email',
                'student.dni',
                'student.institutionName',
                'student.phone',
                'student.grade',
                'student.isActive',
                'student.createdAt',
            ]);
    }

    async findAll(query?: string): Promise<Omit<Student, 'password'>[]> {
        const qb = this.baseQuery();

        if (query) {
            qb.where(
                'student.firstName LIKE :q OR student.lastName LIKE :q OR student.email LIKE :q OR student.dni LIKE :q',
                { q: `%${query}%` },
            );
        }

        return qb.orderBy('student.createdAt', 'DESC').getMany();
    }

    async findOne(id: number): Promise<Omit<Student, 'password'>> {
        const student = await this.baseQuery()
            .where('student.id = :id', { id })
            .getOne();

        if (!student) throw new NotFoundException('Estudiante no encontrado');
        return student;
    }

    async toggleActive(id: number): Promise<{ message: string }> {
        const student = await this.studentRepository.findOne({ where: { id } });
        if (!student) throw new NotFoundException('Estudiante no encontrado');
        student.isActive = !student.isActive;
        await this.studentRepository.save(student);
        return { message: `Estudiante ${student.isActive ? 'activado' : 'desactivado'}` };
    }

    async remove(id: number): Promise<void> {
        const student = await this.studentRepository.findOne({ where: { id } });
        if (!student) throw new NotFoundException('Estudiante no encontrado');
        await this.studentRepository.remove(student);
    }
}