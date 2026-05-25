import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { Institution } from '../institutions/entities/institution.entity';

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

const mockRepo = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
});

describe('AuthService', () => {
    let service: AuthService;
    let userRepo: ReturnType<typeof mockRepo>;
    let studentRepo: ReturnType<typeof mockRepo>;
    let institutionRepo: ReturnType<typeof mockRepo>;
    let jwtService: { signAsync: jest.Mock };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getRepositoryToken(User), useFactory: mockRepo },
                { provide: getRepositoryToken(Student), useFactory: mockRepo },
                { provide: getRepositoryToken(Institution), useFactory: mockRepo },
                { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('mock_token') } },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepo = module.get(getRepositoryToken(User));
        studentRepo = module.get(getRepositoryToken(Student));
        institutionRepo = module.get(getRepositoryToken(Institution));
        jwtService = module.get(JwtService);

        // Prevent onModuleInit from interfering with tests
        userRepo.findOne.mockResolvedValue({ id: 1, email: 'admin@spc.com' });
    });

    it('debería estar definido', () => {
        expect(service).toBeDefined();
    });

    // ─── signIn (admin) ───────────────────────────────────────────────────────

    describe('signIn', () => {
        it('retorna token y datos del usuario con credenciales correctas', async () => {
            const user = { id: 1, email: 'admin@spc.com', password: 'hashed', name: 'Admin', role: 'ADMIN' };
            userRepo.findOne.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.signIn({ email: 'admin@spc.com', password: 'Admin123!' });

            expect(result.accessToken).toBe('mock_token');
            expect(result.user.email).toBe('admin@spc.com');
        });

        it('lanza UnauthorizedException si el usuario no existe', async () => {
            userRepo.findOne.mockResolvedValue(null);
            await expect(service.signIn({ email: 'x@x.com', password: '123' }))
                .rejects.toThrow(UnauthorizedException);
        });

        it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
            userRepo.findOne.mockResolvedValue({ id: 1, password: 'hashed' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            await expect(service.signIn({ email: 'admin@spc.com', password: 'wrong' }))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    // ─── signInStudent ────────────────────────────────────────────────────────

    describe('signInStudent', () => {
        it('retorna token cuando el estudiante existe y está activo', async () => {
            const student = {
                id: 10, email: 's@s.com', password: 'hashed',
                firstName: 'Ana', lastName: 'López', isActive: true,
                institutionName: 'INAH', grade: '3ro',
            };
            studentRepo.findOne.mockResolvedValue(student);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.signInStudent({ email: 's@s.com', password: 'pass' });
            expect(result.accessToken).toBe('mock_token');
            expect(result.student.firstName).toBe('Ana');
        });

        it('lanza UnauthorizedException si la cuenta está desactivada', async () => {
            studentRepo.findOne.mockResolvedValue({ id: 1, isActive: false, password: 'h' });
            await expect(service.signInStudent({ email: 'x@x.com', password: '123' }))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    // ─── registerStudent ──────────────────────────────────────────────────────

    describe('registerStudent', () => {
        it('lanza ConflictException si el correo ya existe', async () => {
            studentRepo.findOne.mockResolvedValueOnce({ id: 1 }); // email check
            await expect(
                service.registerStudent({
                    firstName: 'Pedro', lastName: 'Pérez', email: 'dup@test.com',
                    password: 'pass', institutionName: 'INAH',
                }),
            ).rejects.toThrow(ConflictException);
        });

        it('crea institución automáticamente si no existe', async () => {
            studentRepo.findOne.mockResolvedValue(null); // no dup email/dni
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
            const savedStudent = {
                id: 5, email: 'new@test.com', firstName: 'Luis', lastName: 'Ramos',
                institutionName: 'Nueva Escuela', isActive: true,
            };
            studentRepo.save.mockResolvedValue(savedStudent);
            institutionRepo.findOne.mockResolvedValue(null); // institution doesn't exist
            institutionRepo.save.mockResolvedValue({ id: 99, name: 'Nueva Escuela' });

            await service.registerStudent({
                firstName: 'Luis', lastName: 'Ramos', email: 'new@test.com',
                password: 'pass', institutionName: 'Nueva Escuela',
            });

            expect(institutionRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Nueva Escuela' }),
            );
        });

        it('NO crea institución si ya existe', async () => {
            studentRepo.findOne.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
            studentRepo.save.mockResolvedValue({
                id: 6, email: 'x@x.com', firstName: 'X', lastName: 'Y', institutionName: 'Existente',
            });
            institutionRepo.findOne.mockResolvedValue({ id: 1, name: 'Existente' }); // already exists

            await service.registerStudent({
                firstName: 'X', lastName: 'Y', email: 'x@x.com',
                password: 'pass', institutionName: 'Existente',
            });

            expect(institutionRepo.save).not.toHaveBeenCalled();
        });
    });
});
