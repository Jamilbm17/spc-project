import {
    IsString,
    IsOptional,
    MaxLength,
    IsNumber,
    IsDateString,
    IsEnum,
} from 'class-validator';
import { ActivityStatusEnum } from '../entities/activity.entity';

export class CreateActivityDto {
    @IsString()
    @MaxLength(200)
    title: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @IsString()
    date: string;

    @IsOptional()
    @IsString()
    startTime?: string;

    @IsOptional()
    @IsString()
    endTime?: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    location?: string;

    @IsOptional()
    @IsEnum(ActivityStatusEnum)
    status?: ActivityStatusEnum;

    @IsOptional()
    @IsNumber()
    expectedParticipants?: number;

    @IsOptional()
    @IsNumber()
    institutionId?: number;

    @IsOptional()
    @IsNumber()
    topicId?: number;
}
