import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Activity } from './entities/activity.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Activity])],
    providers: [ActivitiesService],
    controllers: [ActivitiesController],
    exports: [ActivitiesService],
})
export class ActivitiesModule { }
