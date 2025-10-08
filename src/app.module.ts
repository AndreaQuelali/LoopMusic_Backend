import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SongsModule } from './songs/songs.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MixesModule } from './mixes/mixes.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ConfigModule } from '@nestjs/config';
import { RecentlyModule } from './recently/recently.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, SongsModule, AuthModule, MixesModule, FavoritesModule, RecentlyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
