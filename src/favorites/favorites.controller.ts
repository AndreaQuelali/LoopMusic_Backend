import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtService } from '@nestjs/jwt';

function getUserId(jwt: JwtService, req: any): string {
  const auth = req.headers['authorization'] || req.headers['Authorization'];
  if (!auth) throw new Error('No auth header');
  const token = String(auth).replace(/^Bearer\s+/i, '');
  const payload = jwt.decode(token) as any;
  if (!payload?.sub) throw new Error('Token inválido');
  return payload.sub as string;
}

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly svc: FavoritesService, private readonly jwt: JwtService) {}

  @Get('ids')
  async listIds(@Req() req: any) {
    const userId = getUserId(this.jwt, req);
    return this.svc.listIds(userId);
  }

  @Get('songs')
  async listSongs(@Req() req: any) {
    const userId = getUserId(this.jwt, req);
    return this.svc.listSongs(userId);
  }

  @Post(':songId')
  async add(@Param('songId') songId: string, @Req() req: any) {
    const userId = getUserId(this.jwt, req);
    return this.svc.add(userId, songId);
  }

  @Delete(':songId')
  async remove(@Param('songId') songId: string, @Req() req: any) {
    const userId = getUserId(this.jwt, req);
    return this.svc.remove(userId, songId);
  }
}
