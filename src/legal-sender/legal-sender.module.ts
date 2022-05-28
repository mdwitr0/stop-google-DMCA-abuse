import { BrowserModule } from 'src/browser/browser.module';
import { LegalSenderService } from './legal-sender.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [LegalSenderService],
  imports: [BrowserModule],
  exports: [LegalSenderService],
})
export class LegalSenderModule {}
