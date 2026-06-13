import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GradeSubmissionDto {
    @IsNumber()
    @Min(0)
    @Max(20)
    score: number;

    @IsOptional()
    @IsString()
    teacherComment?: string;
}
