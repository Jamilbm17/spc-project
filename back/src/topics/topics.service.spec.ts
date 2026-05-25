import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { Topic } from './entities/topic.entity';

// Mock repository factory
const mockRepo = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
});

describe('TopicsService', () => {
    let service: TopicsService;
    let repo: ReturnType<typeof mockRepo>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TopicsService,
                { provide: getRepositoryToken(Topic), useFactory: mockRepo },
            ],
        }).compile();

        service = module.get<TopicsService>(TopicsService);
        repo = module.get(getRepositoryToken(Topic));
    });

    it('debería estar definido', () => {
        expect(service).toBeDefined();
    });

    // ─── create ──────────────────────────────────────────────────────────────

    describe('create', () => {
        it('crea y guarda un tema correctamente', async () => {
            const dto = { name: 'Salud mental', description: 'Bienestar emocional' };
            const created = { id: 1, ...dto, createdAt: new Date(), updatedAt: new Date() };

            repo.create.mockReturnValue(created);
            repo.save.mockResolvedValue(created);

            const result = await service.create(dto);

            expect(repo.create).toHaveBeenCalledWith(dto);
            expect(repo.save).toHaveBeenCalledWith(created);
            expect(result).toEqual(created);
        });
    });

    // ─── findAll ─────────────────────────────────────────────────────────────

    describe('findAll', () => {
        it('retorna todos los temas sin filtro', async () => {
            const topics = [{ id: 1, name: 'Drogas' }, { id: 2, name: 'Bullying' }];
            const qb = {
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(topics),
            };
            repo.createQueryBuilder.mockReturnValue(qb);

            const result = await service.findAll();

            expect(qb.where).not.toHaveBeenCalled();
            expect(result).toEqual(topics);
        });

        it('aplica filtro de búsqueda cuando se pasa query', async () => {
            const qb = {
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
            };
            repo.createQueryBuilder.mockReturnValue(qb);

            await service.findAll('salud');

            expect(qb.where).toHaveBeenCalledWith(
                'topic.name LIKE :query OR topic.description LIKE :query',
                { query: '%salud%' },
            );
        });
    });

    // ─── findOne ─────────────────────────────────────────────────────────────

    describe('findOne', () => {
        it('retorna el tema cuando existe', async () => {
            const topic = { id: 5, name: 'Vial' };
            repo.findOne.mockResolvedValue(topic);

            const result = await service.findOne(5);
            expect(result).toEqual(topic);
        });

        it('lanza NotFoundException cuando el tema no existe', async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
        });
    });

    // ─── update ──────────────────────────────────────────────────────────────

    describe('update', () => {
        it('actualiza los campos del tema', async () => {
            const topic = { id: 1, name: 'Viejo nombre', description: '' };
            const dto = { name: 'Nuevo nombre' };
            const updated = { ...topic, ...dto };

            repo.findOne.mockResolvedValue(topic);
            repo.save.mockResolvedValue(updated);

            const result = await service.update(1, dto);
            expect(result.name).toBe('Nuevo nombre');
        });

        it('lanza NotFoundException si el tema no existe', async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.update(99, { name: 'x' })).rejects.toThrow(NotFoundException);
        });
    });

    // ─── remove ──────────────────────────────────────────────────────────────

    describe('remove', () => {
        it('elimina el tema correctamente', async () => {
            const topic = { id: 1, name: 'Drogas' };
            repo.findOne.mockResolvedValue(topic);
            repo.remove.mockResolvedValue(undefined);

            await expect(service.remove(1)).resolves.toBeUndefined();
            expect(repo.remove).toHaveBeenCalledWith(topic);
        });

        it('lanza NotFoundException si el tema no existe', async () => {
            repo.findOne.mockResolvedValue(null);
            await expect(service.remove(99)).rejects.toThrow(NotFoundException);
        });
    });
});
