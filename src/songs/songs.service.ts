import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SongsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.song.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
