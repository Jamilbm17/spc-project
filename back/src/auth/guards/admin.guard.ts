import { Injectable, ForbiddenException, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);
        const request = context.switchToHttp().getRequest();
        const user = request['user'];
        if (user?.type !== 'admin') {
            throw new ForbiddenException('Acceso restringido a administradores');
        }
        return true;
    }
}
