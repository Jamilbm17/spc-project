import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    signIn(@Body() dto: SignInDto) {
        return this.authService.signIn(dto);
    }

    @Post('register')
    registerAdmin(@Body() dto: RegisterAdminDto) {
        return this.authService.registerAdmin(dto);
    }

    @Post('student/login')
    signInStudent(@Body() dto: SignInDto) {
        return this.authService.signInStudent(dto);
    }

    @Post('student/register')
    registerStudent(@Body() dto: RegisterStudentDto) {
        return this.authService.registerStudent(dto);
    }
}
