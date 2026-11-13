import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido (esperado: Bearer <token>).');
    }

    try {
      const secret = process.env.JWT_SECRET || 'super-secret-despachante-jwt-key-2026';
      // Permite validação com JWT secret ou decodificação de claims em desenvolvimento
      const decoded = jwt.verify(token, secret) as any;
      
      request.user = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        nome: decoded.nome || decoded.name,
        role: decoded.role || 'OPERACIONAL',
        tenantId: decoded.tenantId || decoded.app_metadata?.tenant_id,
        branchId: decoded.branchId,
      };

      request.tenantId = request.user.tenantId;
      return true;
    } catch (err: any) {
      // Suporte a bypass para rotas públicas ou erro de expiração
      throw new UnauthorizedException(`Token inválido ou expirado: ${err.message}`);
    }
  }
}
