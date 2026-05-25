import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
    constructor(
        @InjectRepository(Topic)
        private readonly topicRepository: Repository<Topic>,
    ) { }

    async create(dto: CreateTopicDto): Promise<Topic> {
        const topic = this.topicRepository.create(dto);
        return this.topicRepository.save(topic);
    }

    async findAll(query?: string): Promise<Topic[]> {
        const qb = this.topicRepository.createQueryBuilder('topic');
        if (query) {
            qb.where('topic.name LIKE :query OR topic.description LIKE :query', {
                query: `%${query}%`,
            });
        }
        return qb.orderBy('topic.createdAt', 'DESC').getMany();
    }

    async findOne(id: number): Promise<Topic> {
        const topic = await this.topicRepository.findOne({ where: { id } });
        if (!topic) throw new NotFoundException('Tema no encontrado');
        return topic;
    }

    async update(id: number, dto: UpdateTopicDto): Promise<Topic> {
        const topic = await this.findOne(id);
        Object.assign(topic, dto);
        return this.topicRepository.save(topic);
    }

    async remove(id: number): Promise<void> {
        const topic = await this.findOne(id);
        await this.topicRepository.remove(topic);
    }
}
