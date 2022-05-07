import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { OauthModule } from './oauth/oauth.module';
import { getConfigModuleOptions } from 'src/common/configs/config-module.config';

@Module({
  imports: [OauthModule, ConfigModule.forRoot(getConfigModuleOptions())],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
