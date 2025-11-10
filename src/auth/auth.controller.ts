import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly jwt: JwtService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  private getUserId(req: any): string {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth) throw new Error('No autorizado');
    const token = String(auth).replace(/^Bearer\s+/i, '');
    const payload = this.jwt.decode(token) as any;
    if (!payload?.sub) throw new Error('No autorizado');
    return String(payload.sub);
  }

  @Get('me')
  me(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.auth.me(userId);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() body: { username: string }) {
    const userId = this.getUserId(req);
    return this.auth.updateUsername(userId, body.username);
  }

  @Patch('me/password')
  changePassword(@Req() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    const userId = this.getUserId(req);
    return this.auth.changePassword(userId, body.currentPassword, body.newPassword);
  }
}
