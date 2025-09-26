import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Basic fetch wrapper (Node 18 has global fetch)
async function jamendoFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jamendo request failed: ${res.status} ${res.statusText} -> ${text}`);
  }
  return res.json() as Promise<T>;
}

// Very simple heuristic to assign tags when Jamendo doesn't provide any
function guessTagsFromText(...texts: (string | null | undefined)[]): string[] {
  const joined = (texts.filter(Boolean).join(' ') || '').toLowerCase();
  const tags: string[] = [];
  const push = (t: string) => { if (!tags.includes(t)) tags.push(t); };

  if (/lo\s?fi|lofi|chill|study|relax|sleep|calm|vibes/.test(joined)) push('lofi'), push('chill');
  if (/hip\s?hop|rap|trap/.test(joined)) push('hiphop');
  if (/edm|electro|electronic|dance|house|techno|trance|dubstep/.test(joined)) push('electronic');
  if (/rock|metal|punk|grunge/.test(joined)) push('rock');
  if (/pop|synthpop|k\-?pop/.test(joined)) push('pop');
  if (/jazz|blues|swing/.test(joined)) push('jazz');
  if (/classical|orchestral|piano|violin|symphony|concerto/.test(joined)) push('classical');
  if (/folk|acoustic|singer\s?songwriter|country/.test(joined)) push('acoustic');
  if (/ambient|drone|soundscape/.test(joined)) push('ambient');
  if (/latin|salsa|bachata|reggaeton|cumbia|tango/.test(joined)) push('latin');

  if (tags.length === 0) push('other');
  return tags.slice(0, 3);
}

// Map Jamendo track payload to our Song fields
function mapTrack(track: any) {
  const released = track.releasedate || track.album_releasedate || '';
  const year = /^(\d{4})/.exec(released)?.[1];
  const tags: string[] = [];
  const genres = track.musicinfo?.tags?.genres ?? [];
  const moods = track.musicinfo?.tags?.moods ?? [];
  for (const g of genres) if (g?.name) tags.push(g.name);
  for (const m of moods) if (m?.name) tags.push(m.name);

  // fallback tags when none provided
  const fallback = tags.length === 0 ? guessTagsFromText(track.name, track.artist_name, track.album_name) : [];

  return {
    title: track.name || 'Unknown',
    artist: track.artist_name || 'Unknown',
    album: track.album_name || null,
    year: year ? parseInt(year, 10) : null,
    duration: typeof track.duration === 'number' ? track.duration : null,
    license: track.license || track.license_cc || null,
    audioUrl: track.audio || track.audio_download || null,
    coverUrl: track.image || null,
    tags: tags.length ? tags : fallback,
    jamendoId: String(track.id || ''),
    // initialize playCount from stats if available
    playCount: typeof track.stats?.listened === 'number' ? track.stats.listened : 0,
  } as const;
}

async function main() {
  const clientId = process.env.JAMENDO_CLIENT_ID;
  if (!clientId) throw new Error('Missing JAMENDO_CLIENT_ID in environment');

  const base = 'https://api.jamendo.com/v3.0/tracks/';
  const pageSize = 100; // pedir más por página para lograr álbumes distintos
  const target = 50; // canciones deseadas
  let offset = 0;

  type JamendoResponse = { results: any[] };
  const albumSet = new Set<string>();
  let processed = 0, upserted = 0, skippedNoId = 0, skippedDuplicateAlbum = 0;

  while (upserted < target && offset < 2000) { // hard-stop de seguridad
    const params = new URLSearchParams({
      client_id: clientId,
      format: 'json',
      limit: String(pageSize),
      offset: String(offset),
      include: 'musicinfo+stats',
      audioformat: 'mp31',
      order: 'popularity_total_desc',
    });
    const url = `${base}?${params.toString()}`;
    const data = await jamendoFetch<JamendoResponse>(url);
    const tracks = data.results || [];
    if (tracks.length === 0) break;

    for (const t of tracks) {
      processed++;
      const mapped = mapTrack(t);
      if (!mapped.jamendoId) { skippedNoId++; continue; }

      const albumKey = (mapped.album || '').trim().toLowerCase();
      if (albumKey && albumSet.has(albumKey)) { skippedDuplicateAlbum++; continue; }

      // Upsert and then mark album as used
      await prisma.song.upsert({
        where: { jamendoId: mapped.jamendoId },
        update: {
          title: mapped.title,
          artist: mapped.artist,
          album: mapped.album ?? undefined,
          year: mapped.year ?? undefined,
          duration: mapped.duration ?? undefined,
          license: mapped.license ?? undefined,
          audioUrl: mapped.audioUrl ?? undefined,
          coverUrl: mapped.coverUrl ?? undefined,
          tags: mapped.tags,
          playCount: mapped.playCount ?? 0,
        },
        create: {
          title: mapped.title,
          artist: mapped.artist,
          album: mapped.album ?? undefined,
          year: mapped.year ?? undefined,
          duration: mapped.duration ?? undefined,
          license: mapped.license ?? undefined,
          audioUrl: mapped.audioUrl ?? undefined,
          coverUrl: mapped.coverUrl ?? undefined,
          tags: mapped.tags,
          jamendoId: mapped.jamendoId,
          playCount: mapped.playCount ?? 0,
        },
        select: { id: true },
      });

      if (albumKey) albumSet.add(albumKey);
      upserted++;
      if (upserted >= target) break;
    }
    offset += pageSize;
  }

  console.log(
    `Processed ${processed} tracks across pages. Upserted(unique albums): ${upserted}, ` +
    `Skipped(no id): ${skippedNoId}, Skipped(duplicate album): ${skippedDuplicateAlbum}`
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
