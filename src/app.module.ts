import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BrowserModule } from 'src/browser/browser.module';
import { ConfigModule } from '@nestjs/config';
import { GmailModule } from './gmail/gmail.module';
import { LegalHandleModule } from './legal-handle/legal-handle.module';
import { LegalSenderModule } from './legal-sender/legal-sender.module';
import { Module } from '@nestjs/common';
import { OauthModule } from './oauth/oauth.module';
import { getConfigModuleOptions } from 'src/common/configs/config-module.config';

@Module({
  imports: [
    OauthModule,
    ConfigModule.forRoot(getConfigModuleOptions()),
    GmailModule,
    BrowserModule,
    LegalSenderModule,
    GmailModule,
    LegalHandleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
