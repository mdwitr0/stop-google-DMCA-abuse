import { BrowserService } from './browser.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [BrowserService],
  exports: [BrowserService],
})
export class BrowserModule {}
