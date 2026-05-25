import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRoleEnum } from './entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { Institution, InstitutionTypeEnum } from '../institutions/entities/institution.entity';
import { SignInDto } from './dto/sign-in.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
        @InjectRepository(Institution)
        private readonly institutionRepository: Repository<Institution>,
        private readonly jwtService: JwtService,
    ) { }

    async onModuleInit() {
        const exists = await this.userRepository.findOne({
            where: { email: 'admin@spc.com' },
        });
        if (!exists) {
            const hashed = await bcrypt.hash('Admin123!', 10);
            await this.userRepository.save({
                email: 'admin@spc.com',
                password: hashed,
                name: 'Administrador SPC',
                role: UserRoleEnum.ADMIN,
            });
            console.log('Usuario admin creado: admin@spc.com / Admin123!');
        }
    }

    // ─── Admin / Teacher ────────────────────────────────────────────────────────

    async signIn(dto: SignInDto) {
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
        });

        if (!user) throw new UnauthorizedException('Credenciales inválidas');

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            type: 'admin',
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }

    async registerAdmin(dto: RegisterAdminDto) {
        const exists = await this.userRepository.findOne({ where: { email: dto.email } });
        if (exists) throw new ConflictException('El correo ya está registrado');

        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.userRepository.save({
            email: dto.email,
            password: hashed,
            name: dto.name,
            phone: dto.phone,
            role: (dto.role as UserRoleEnum) ?? UserRoleEnum.TEACHER,
        });

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            type: 'admin',
        };

        const accessToken = await this.jwtService.signAsync(payload);
        return {
            accessToken,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }

    // ─── Students ────────────────────────────────────────────────────────────────

    async signInStudent(dto: SignInDto) {
        const student = await this.studentRepository.findOne({
            where: { email: dto.email },
        });

        if (!student) throw new UnauthorizedException('Credenciales inválidas');
        if (!student.isActive) throw new UnauthorizedException('Cuenta desactivada');

        const isMatch = await bcrypt.compare(dto.password, student.password);
        if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

        const payload = {
            sub: student.id,
            email: student.email,
            name: `${student.firstName} ${student.lastName}`,
            type: 'student',
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            student: {
                id: student.id,
                email: student.email,
                firstName: student.firstName,
                lastName: student.lastName,
                institutionName: student.institutionName,
                grade: student.grade,
            },
        };
    }

    async registerStudent(dto: RegisterStudentDto) {
        const emailExists = await this.studentRepository.findOne({ where: { email: dto.email } });
        if (emailExists) throw new ConflictException('El correo ya está registrado');

        if (dto.dni) {
            const dniExists = await this.studentRepository.findOne({ where: { dni: dto.dni } });
            if (dniExists) throw new ConflictException('El DNI ya está registrado');
        }

        const hashed = await bcrypt.hash(dto.password, 10);
        const student = await this.studentRepository.save({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: hashed,
            dni: dto.dni || null,
            institutionName: dto.institutionName,
            phone: dto.phone,
            grade: dto.grade,
        });

        // Auto-create institution if provided and not already registered
        if (dto.institutionName?.trim()) {
            const exists = await this.institutionRepository.findOne({
                where: { name: dto.institutionName.trim() },
            });
            if (!exists) {
                await this.institutionRepository.save({
                    name: dto.institutionName.trim(),
                    type: InstitutionTypeEnum.SCHOOL,
                    active: true,
                });
            }
        }

        const payload = {
            sub: student.id,
            email: student.email,
            name: `${student.firstName} ${student.lastName}`,
            type: 'student',
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            student: {
                id: student.id,
                email: student.email,
                firstName: student.firstName,
                lastName: student.lastName,
                institutionName: student.institutionName,
                grade: student.grade,
            },
        };
    }

    async validateToken(token: string) {
        try {
            return await this.jwtService.verifyAsync(token);
        } catch {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }
}
