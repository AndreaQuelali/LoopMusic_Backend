import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMixDto } from './dto/create-mix.dto';

@Injectable()
export class MixesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.mix.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateMixDto) {
    if (!dto.name?.trim()) throw new Error('El nombre es requerido');
    const isPublic = !!dto.isPublic;
    const songIds = Array.isArray(dto.songIds) ? dto.songIds.filter(Boolean) : [];
    return this.prisma.mix.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        isPublic,
        songIds,
      },
    });
  }

  async getSongs(mixId: string) {
    const mix = await this.prisma.mix.findUnique({ where: { id: mixId } });
    if (!mix) throw new Error('Mix no encontrado');
    const ids = mix.songIds || [];
    if (ids.length === 0) return [];
    const songs = await this.prisma.song.findMany({ where: { id: { in: ids } } });
    // preserve order defined in mix.songIds
    const byId = new Map(songs.map(s => [s.id, s] as const));
    return ids.map(id => byId.get(id)).filter(Boolean);
  }

  async getOne(mixId: string) {
    const mix = await this.prisma.mix.findUnique({ where: { id: mixId } });
    if (!mix) throw new Error('Mix no encontrado');
    return mix;
  }

  async addSongs(mixId: string, toAdd: string[]) {
    const mix = await this.getOne(mixId);
    const current = mix.songIds || [];
    const set = new Set(current);
    const appended: string[] = [];
    for (const id of toAdd) if (id && !set.has(id)) { set.add(id); appended.push(id); }
    const next = current.concat(appended);
    const updated = await this.prisma.mix.update({ where: { id: mixId }, data: { songIds: next } });
    return updated;
  }

  async removeSong(mixId: string, songId: string) {
    const mix = await this.getOne(mixId);
    const next = (mix.songIds || []).filter(id => id !== songId);
    const updated = await this.prisma.mix.update({ where: { id: mixId }, data: { songIds: next } });
    return updated;
  }

  async updateOrder(mixId: string, orderedIds: string[]) {
    const mix = await this.getOne(mixId);
    const currentSet = new Set(mix.songIds || []);
    // Keep only ids that are already part of the mix; ignore unknowns
    const filtered = orderedIds.filter(id => currentSet.has(id));
    // If some current ids were not in orderedIds, append them at the end to avoid loss
    for (const id of mix.songIds || []) {
      if (!filtered.includes(id)) filtered.push(id);
    }
    const updated = await this.prisma.mix.update({ where: { id: mixId }, data: { songIds: filtered } });
    return updated;
  }
}
