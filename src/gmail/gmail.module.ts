import { GmailService } from './gmail.service';
import { Module } from '@nestjs/common';
import { OauthModule } from 'src/oauth/oauth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [GmailService],
  imports: [OauthModule, PrismaModule],
  exports: [GmailService],
})
export class GmailModule {}
