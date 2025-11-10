import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async listIds(userId: string) {
    const items = await this.prisma.favorite.findMany({ where: { userId }, select: { songId: true } });
    return items.map(i => i.songId);
  }

  async listSongs(userId: string) {
    const ids = await this.listIds(userId);
    if (ids.length === 0) return [];
    const songs = await this.prisma.song.findMany({ where: { id: { in: ids } } });
    // Keep some order (by createdAt desc of favorite could be better; for simplicity keep DB order)
    const map = new Map(songs.map(s => [s.id, s] as const));
    return ids.map(id => map.get(id)).filter(Boolean);
  }

  async add(userId: string, songId: string) {
    await this.prisma.favorite.upsert({
      where: { userId_songId: { userId, songId } },
      update: {},
      create: { userId, songId },
    });
    return { ok: true };
  }

  async remove(userId: string, songId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, songId } });
    return { ok: true };
  }
}
