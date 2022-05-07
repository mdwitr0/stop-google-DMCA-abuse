import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OauthModule } from './oauth/oauth.module';

@Module({
  imports: [OauthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
