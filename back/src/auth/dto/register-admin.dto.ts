import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterAdminDto {
    @IsString()
    name: string;

    @IsEmail({}, { message: 'Correo electrónico inválido' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEnum(['ADMIN', 'TEACHER'], { message: 'Rol inválido' })
    role?: string;
}
