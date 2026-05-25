import {
    IsString,
    IsOptional,
    MaxLength,
    IsNumber,
    IsEmail,
} from 'class-validator';

export class CreateParticipantDto {
    @IsString()
    @MaxLength(200)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    documentNumber?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Correo electrónico inválido' })
    email?: string;

    @IsOptional()
    @IsNumber()
    age?: number;

    @IsOptional()
    @IsNumber()
    institutionId?: number;
}
