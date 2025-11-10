import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { MixesService } from './mixes.service';
import { CreateMixDto } from './dto/create-mix.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('mixes')
export class MixesController {
  constructor(private readonly mixes: MixesService, private readonly jwt: JwtService) {}

  private getUserId(req: any): string | null {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth) return null;
    const token = String(auth).replace(/^Bearer\s+/i, '');
    const payload = this.jwt.decode(token) as any;
    return payload?.sub ?? null;
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.mixes.findAll(userId);
  }

  @Post()
  create(@Body() dto: CreateMixDto, @Req() req: any) {
    const userId = this.getUserId(req);
    if (!userId) throw new Error('No autorizado');
    return this.mixes.create(dto, userId);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @Req() req: any) {
    const userId = this.getUserId(req);
    return this.mixes.getOne(id, userId);
  }

  @Get(':id/songs')
  getSongs(@Param('id') id: string, @Req() req: any) {
    const userId = this.getUserId(req);
    return this.mixes.getSongs(id, userId);
  }

  @Post(':id/songs')
  addSongs(@Param('id') id: string, @Body() body: { songIds: string[] }, @Req() req: any) {
    const userId = this.getUserId(req);
    if (!userId) throw new Error('No autorizado');
    return this.mixes.addSongs(id, body?.songIds || [], userId);
  }

  @Delete(':id/songs/:songId')
  removeSong(@Param('id') id: string, @Param('songId') songId: string, @Req() req: any) {
    const userId = this.getUserId(req);
    if (!userId) throw new Error('No autorizado');
    return this.mixes.removeSong(id, songId, userId);
  }

  @Put(':id/order')
  updateOrder(@Param('id') id: string, @Body() body: { songIds: string[] }, @Req() req: any) {
    const userId = this.getUserId(req);
    if (!userId) throw new Error('No autorizado');
    return this.mixes.updateOrder(id, body?.songIds || [], userId);
  }
}
