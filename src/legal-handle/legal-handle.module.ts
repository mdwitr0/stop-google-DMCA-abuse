import { Cron, CronExpression } from '@nestjs/schedule';
import { Module, OnApplicationBootstrap } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { GmailModule } from 'src/gmail/gmail.module';
import { LegalHandleService } from './legal-handle.service';
import { LegalSenderModule } from 'src/legal-sender/legal-sender.module';

@Module({
  imports: [GmailModule, ConfigModule, LegalSenderModule],
  providers: [LegalHandleService],
  exports: [LegalHandleService],
})
export class LegalHandleModule implements OnApplicationBootstrap {
  constructor(private readonly legalHandleService: LegalHandleService) {}

  async onApplicationBootstrap() {
    this.messageUpdate();
  }

  @Cron(CronExpression.EVERY_5_HOURS)
  async messageUpdate() {
    this.legalHandleService.messageUpdate();
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async cancelAbuse() {
    this.legalHandleService.cancelAbuse();
  }
}
