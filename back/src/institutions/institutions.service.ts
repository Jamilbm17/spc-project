import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './entities/institution.entity';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
    constructor(
        @InjectRepository(Institution)
        private readonly institutionRepository: Repository<Institution>,
    ) { }

    async create(dto: CreateInstitutionDto): Promise<Institution> {
        const institution = this.institutionRepository.create(dto);
        return this.institutionRepository.save(institution);
    }

    async findAll(query?: string): Promise<Institution[]> {
        const qb = this.institutionRepository.createQueryBuilder('institution');
        if (query) {
            qb.where(
                'institution.name LIKE :query OR institution.city LIKE :query',
                { query: `%${query}%` },
            );
        }
        return qb.orderBy('institution.createdAt', 'DESC').getMany();
    }

    async findOne(id: number): Promise<Institution> {
        const institution = await this.institutionRepository.findOne({
            where: { id },
        });
        if (!institution) throw new NotFoundException('Institución no encontrada');
        return institution;
    }

    async update(id: number, dto: UpdateInstitutionDto): Promise<Institution> {
        const institution = await this.findOne(id);
        Object.assign(institution, dto);
        return this.institutionRepository.save(institution);
    }

    async remove(id: number): Promise<void> {
        const institution = await this.findOne(id);
        await this.institutionRepository.remove(institution);
    }
}
