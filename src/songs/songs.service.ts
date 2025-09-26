import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SongsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.song.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findTop(limit = 10) {
    return this.prisma.song.findMany({
      orderBy: { playCount: 'desc' },
      take: limit,
    });
  }

  async findTopArtists(limit = 10) {
    // Aggregate in app layer (MongoDB provider has limited groupBy support in Prisma)
    const songs = await this.prisma.song.findMany({
      select: { artist: true, playCount: true, coverUrl: true },
    });
    const map = new Map<string, { artist: string; totalPlayCount: number; coverUrl?: string | null }>();
    for (const s of songs) {
      const item = map.get(s.artist) || { artist: s.artist, totalPlayCount: 0, coverUrl: s.coverUrl };
      item.totalPlayCount += s.playCount ?? 0;
      if (!item.coverUrl && s.coverUrl) item.coverUrl = s.coverUrl;
      map.set(s.artist, item);
    }
    return Array.from(map.values())
      .sort((a, b) => b.totalPlayCount - a.totalPlayCount)
      .slice(0, limit);
  }
}
