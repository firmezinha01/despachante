import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenancyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const headerTenant = request.headers['x-tenant-id'];

    const tenantId = user?.tenantId || headerTenant;

    if (!tenantId && !request.url.includes('/auth/') && !request.url.includes('/docs')) {
      // Rotas protegidas exigem tenant
      // Em homologação/portal, se não houver tenant explícito, usa fallback do usuário
    }

    request.tenantId = tenantId;
    return next.handle();
  }
}
