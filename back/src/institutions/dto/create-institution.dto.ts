import {
    IsString,
    IsOptional,
    MaxLength,
    IsEnum,
    IsBoolean,
} from 'class-validator';
import { InstitutionTypeEnum } from '../entities/institution.entity';

export class CreateInstitutionDto {
    @IsString()
    @MaxLength(200)
    name: string;

    @IsEnum(InstitutionTypeEnum)
    type: InstitutionTypeEnum;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    address?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    contactName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    contactPhone?: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}
