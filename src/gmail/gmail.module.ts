import { GmailService } from './gmail.service';
import { Module } from '@nestjs/common';
import { OauthModule } from 'src/oauth/oauth.module';

@Module({
  providers: [GmailService],
  imports: [OauthModule],
})
export class GmailModule {}
