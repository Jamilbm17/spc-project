import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { Institution } from '../institutions/entities/institution.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Student, Institution])],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
