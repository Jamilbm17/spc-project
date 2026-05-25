import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    ExecutionContext,
    CanActivate,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class StudentGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token no encontrado');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: 'spc-secret-key-2024',
            });
            if (payload.type !== 'student') {
                throw new ForbiddenException('Acceso restringido a estudiantes');
            }
            request['user'] = payload;
        } catch (err) {
            if (err instanceof ForbiddenException) throw err;
            throw new UnauthorizedException('Token inválido o expirado');
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
