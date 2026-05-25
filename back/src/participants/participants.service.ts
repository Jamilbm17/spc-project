import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from './entities/participant.entity';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

@Injectable()
export class ParticipantsService {
    constructor(
        @InjectRepository(Participant)
        private readonly participantRepository: Repository<Participant>,
    ) { }

    async create(dto: CreateParticipantDto): Promise<Participant> {
        const participant = this.participantRepository.create(dto);
        return this.participantRepository.save(participant);
    }

    async findAll(query?: string): Promise<Participant[]> {
        const qb = this.participantRepository
            .createQueryBuilder('participant')
            .leftJoinAndSelect('participant.institution', 'institution');

        if (query) {
            qb.where(
                'participant.name LIKE :query OR participant.documentNumber LIKE :query',
                { query: `%${query}%` },
            );
        }
        return qb.orderBy('participant.createdAt', 'DESC').getMany();
    }

    async findOne(id: number): Promise<Participant> {
        const participant = await this.participantRepository.findOne({
            where: { id },
            relations: ['institution'],
        });
        if (!participant) throw new NotFoundException('Participante no encontrado');
        return participant;
    }

    async update(id: number, dto: UpdateParticipantDto): Promise<Participant> {
        const participant = await this.findOne(id);
        Object.assign(participant, dto);
        return this.participantRepository.save(participant);
    }

    async remove(id: number): Promise<void> {
        const participant = await this.findOne(id);
        await this.participantRepository.remove(participant);
    }
}
