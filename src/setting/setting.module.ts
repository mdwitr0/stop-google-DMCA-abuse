import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SettingService } from './setting.service';

@Module({
  providers: [SettingService],
  imports: [PrismaModule],
  exports: [SettingService],
})
export class SettingModule {}
