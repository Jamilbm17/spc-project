import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
    @IsNumber()
    questionId: number;

    @IsOptional()
    @IsString()
    textAnswer?: string;

    @IsOptional()
    @IsNumber()
    selectedOption?: number;
}

export class SubmitTaskDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];
}
