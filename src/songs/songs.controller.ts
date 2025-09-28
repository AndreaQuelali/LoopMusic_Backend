import { Controller, Get, Param, Post } from '@nestjs/common';
import { SongsService } from './songs.service';

@Controller('songs')
export class SongsController {
  constructor(private readonly songs: SongsService) {}

  @Get()
  findAll() {
    return this.songs.findAll();
  }

  @Get('top')
  findTop() {
    return this.songs.findTop(10);
  }

  @Get('top-artists')
  findTopArtists() {
    return this.songs.findTopArtists(10);
  }

  @Post(':id/play')
  incrementPlay(@Param('id') id: string) {
    return this.songs.incrementPlay(id);
  }
}
