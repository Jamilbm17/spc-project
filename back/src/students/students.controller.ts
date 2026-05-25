import {
    Controller,
    Get,
    Delete,
    Param,
    ParseIntPipe,
    Query,
    UseGuards,
    Patch,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Get()
    findAll(@Query('query') query?: string) {
        return this.studentsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.studentsService.findOne(id);
    }

    @Patch(':id/toggle')
    toggleActive(@Param('id', ParseIntPipe) id: number) {
        return this.studentsService.toggleActive(id);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.studentsService.remove(id);
    }
}
