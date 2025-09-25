import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { MixesService } from './mixes.service';
import { CreateMixDto } from './dto/create-mix.dto';

@Controller('mixes')
export class MixesController {
  constructor(private readonly mixes: MixesService) {}

  @Get()
  findAll() {
    return this.mixes.findAll();
  }

  @Post()
  create(@Body() dto: CreateMixDto) {
    return this.mixes.create(dto);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.mixes.getOne(id);
  }

  @Get(':id/songs')
  getSongs(@Param('id') id: string) {
    return this.mixes.getSongs(id);
  }

  @Post(':id/songs')
  addSongs(@Param('id') id: string, @Body() body: { songIds: string[] }) {
    return this.mixes.addSongs(id, body?.songIds || []);
  }

  @Delete(':id/songs/:songId')
  removeSong(@Param('id') id: string, @Param('songId') songId: string) {
    return this.mixes.removeSong(id, songId);
  }

  @Put(':id/order')
  updateOrder(@Param('id') id: string, @Body() body: { songIds: string[] }) {
    return this.mixes.updateOrder(id, body?.songIds || []);
  }
}
