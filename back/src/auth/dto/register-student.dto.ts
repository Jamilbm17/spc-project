import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterStudentDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail({}, { message: 'Correo electrónico inválido' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @IsOptional()
    @IsString()
    dni?: string;

    @IsString()
    institutionName: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    grade?: string;
}
