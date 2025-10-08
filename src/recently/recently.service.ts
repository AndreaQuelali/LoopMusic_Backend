import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecentlyService {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, songId: string) {
    await this.prisma.recently.upsert({
      where: { userId_songId: { userId, songId } },
      update: { createdAt: new Date() },
      create: { userId, songId },
      select: { id: true },
    });
    return { ok: true };
  }

  async listSongs(userId: string, limit = 30) {
    const recents = await this.prisma.recently.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { songId: true },
    });
    const ids = recents.map(r => r.songId);
    if (ids.length === 0) return [];
    const songs = await this.prisma.song.findMany({ where: { id: { in: ids } } });
    const byId = new Map(songs.map(s => [s.id, s] as const));
    return ids.map(id => byId.get(id)).filter(Boolean);
  }
}
