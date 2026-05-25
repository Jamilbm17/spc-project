import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('activities')
export class ActivitiesController {
    constructor(private readonly activitiesService: ActivitiesService) { }

    @UseGuards(AdminGuard)
    @Post()
    create(@Body() dto: CreateActivityDto) {
        return this.activitiesService.create(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Query('query') query?: string, @Query('month') month?: string) {
        return this.activitiesService.findAll(query, month);
    }

    @UseGuards(JwtAuthGuard)
    @Get('calendar')
    findCalendar(
        @Query('year', ParseIntPipe) year: number,
        @Query('month', ParseIntPipe) month: number,
    ) {
        return this.activitiesService.findCalendar(year, month);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.activitiesService.findOne(id);
    }

    @UseGuards(AdminGuard)
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateActivityDto,
    ) {
        return this.activitiesService.update(id, dto);
    }

    @UseGuards(AdminGuard)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.activitiesService.remove(id);
    }
}
