import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { RecentlyService } from './recently.service';
import { JwtService } from '@nestjs/jwt';

function getUserId(jwt: JwtService, req: any): string {
  const auth = req.headers['authorization'] || req.headers['Authorization'];
  if (!auth) throw new Error('No autorizado');
  const token = String(auth).replace(/^Bearer\s+/i, '');
  const payload = jwt.decode(token) as any;
  if (!payload?.sub) throw new Error('No autorizado');
  return String(payload.sub);
}

@Controller('recently')
export class RecentlyController {
  constructor(private readonly svc: RecentlyService, private readonly jwt: JwtService) {}

  @Get('songs')
  async list(@Req() req: any) {
    const userId = getUserId(this.jwt, req);
    return this.svc.listSongs(userId, 30);
    
  }

  @Post(':songId')
  async add(@Param('songId') songId: string, @Req() req: any) {
    const userId = getUserId(this.jwt, req);
    return this.svc.add(userId, songId);
  }
}
