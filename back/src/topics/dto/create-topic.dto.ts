import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class CreateTopicDto {
    @IsString()
    @MaxLength(150)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}
