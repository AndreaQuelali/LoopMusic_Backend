import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SongsModule } from './songs/songs.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MixesModule } from './mixes/mixes.module';

@Module({
  imports: [PrismaModule, SongsModule, AuthModule, MixesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
