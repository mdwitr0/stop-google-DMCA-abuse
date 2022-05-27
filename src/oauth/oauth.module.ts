import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';
import { SettingModule } from 'src/setting/setting.module';

@Module({
  imports: [SettingModule],
  providers: [OauthService],
  controllers: [OauthController],
  exports: [OauthService],
})
export class OauthModule {}
