import { IsString, IsOptional } from 'class-validator';

export class CreateCourseDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}
