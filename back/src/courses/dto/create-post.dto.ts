import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreatePostDto {
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    dueDate?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(20)
    maxScore?: number;
}
