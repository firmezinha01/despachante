import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';

class LoginDto {
  email: string;
  senha: string;
}

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login de usuário do despachante com JWT e contexto Multi-Tenant' })
  @ApiResponse({ status: 200, description: 'Login bem sucedido com token JWT' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.senha);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário autenticado e informações da empresa' })
  async getMe(@CurrentUser() user: RequestUser) {
    return this.authService.getMe(user.id);
  }
}
