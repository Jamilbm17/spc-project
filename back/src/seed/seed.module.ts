import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Topic } from '../topics/entities/topic.entity';
import { Institution } from '../institutions/entities/institution.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Student } from '../students/entities/student.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Topic, Institution, Activity, Student])],
    providers: [SeedService],
})
export class SeedModule { }
