import { IsString, IsOptional, IsIn, IsArray, IsNumber, Min } from 'class-validator';

export class CreateQuestionDto {
    @IsString()
    text: string;

    @IsIn(['OPEN_TEXT', 'MULTIPLE_CHOICE', 'POLL'])
    type: 'OPEN_TEXT' | 'MULTIPLE_CHOICE' | 'POLL';

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    options?: string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    correctOptionIndex?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    points?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    order?: number;
}
