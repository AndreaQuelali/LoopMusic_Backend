import { Module } from '@nestjs/common';
import { RecentlyService } from './recently.service';
import { RecentlyController } from './recently.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [RecentlyController],
  providers: [RecentlyService],
})
export class RecentlyModule {}
