import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
    constructor(
        @InjectRepository(Activity)
        private readonly activityRepository: Repository<Activity>,
    ) { }

    async create(dto: CreateActivityDto): Promise<Activity> {
        const activity = this.activityRepository.create(dto);
        return this.activityRepository.save(activity);
    }

    async findAll(query?: string, month?: string): Promise<Activity[]> {
        const qb = this.activityRepository
            .createQueryBuilder('activity')
            .leftJoinAndSelect('activity.institution', 'institution')
            .leftJoinAndSelect('activity.topic', 'topic');

        if (query) {
            qb.andWhere(
                'activity.title LIKE :query OR activity.location LIKE :query',
                { query: `%${query}%` },
            );
        }

        if (month) {
            // month format: YYYY-MM
            qb.andWhere("strftime('%Y-%m', activity.date) = :month", { month });
        }

        return qb.orderBy('activity.date', 'ASC').getMany();
    }

    async findCalendar(year: number, month: number): Promise<Activity[]> {
        const paddedMonth = String(month).padStart(2, '0');
        const monthStr = `${year}-${paddedMonth}`;
        return this.activityRepository
            .createQueryBuilder('activity')
            .leftJoinAndSelect('activity.institution', 'institution')
            .leftJoinAndSelect('activity.topic', 'topic')
            .where("strftime('%Y-%m', activity.date) = :month", { month: monthStr })
            .orderBy('activity.date', 'ASC')
            .getMany();
    }

    async findOne(id: number): Promise<Activity> {
        const activity = await this.activityRepository.findOne({
            where: { id },
            relations: ['institution', 'topic'],
        });
        if (!activity) throw new NotFoundException('Actividad no encontrada');
        return activity;
    }

    async update(id: number, dto: UpdateActivityDto): Promise<Activity> {
        const activity = await this.findOne(id);
        Object.assign(activity, dto);
        return this.activityRepository.save(activity);
    }

    async remove(id: number): Promise<void> {
        const activity = await this.findOne(id);
        await this.activityRepository.remove(activity);
    }
}
