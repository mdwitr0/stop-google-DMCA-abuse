import { BrowserModule } from 'src/browser/browser.module';
import { ConfigModule } from '@nestjs/config';
import { LegalSenderService } from './legal-sender.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [ConfigModule, LegalSenderService],
  imports: [BrowserModule],
  exports: [LegalSenderService],
})
export class LegalSenderModule {}
