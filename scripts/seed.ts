import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.song.count();
  if (count > 0) {
    console.log(`Songs already exist: ${count}. Skipping seed.`);
    return;
  }
  await prisma.song.createMany({
    data: [
      {
        title: 'Midnight Drive',
        artist: 'Neon Waves',
        coverUrl: 'https://picsum.photos/seed/cover-1/600/400',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      },
      {
        title: 'Sunset Boulevard',
        artist: 'City Lights',
        coverUrl: 'https://picsum.photos/seed/cover-2/600/400',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      },
      {
        title: 'Ocean Breeze',
        artist: 'Blue Horizon',
        coverUrl: 'https://picsum.photos/seed/cover-3/600/400',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      },
    ],
  });
  console.log('Seed completed: songs created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
