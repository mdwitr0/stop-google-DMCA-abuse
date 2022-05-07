import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';

@Module({
  providers: [GmailService]
})
export class GmailModule {}
