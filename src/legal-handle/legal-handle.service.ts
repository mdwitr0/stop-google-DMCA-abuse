import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { GmailService } from 'src/gmail/gmail.service';
import { LegalSenderService } from 'src/legal-sender/legal-sender.service';
import { MessageStatus } from '@prisma/client';
import { OAuthKeys } from 'src/oauth/oauth.enum';
import { SettingService } from 'src/setting/setting.service';
import { StatusEnum } from 'src/common/enums/status';

@Injectable()
export class LegalHandleService {
  private readonly logger = new Logger(LegalHandleService.name);
  constructor(
    private readonly gmailService: GmailService,
    private readonly configService: ConfigService,
    private readonly legalSenderService: LegalSenderService,
    private readonly settingService: SettingService,
  ) {}

  async messageUpdate(): Promise<{ status: StatusEnum }> {
    const refreshToken = await this.settingService.get(OAuthKeys.REFRESH_TOKEN);
    const accessToken = await this.settingService.get(OAuthKeys.ACCESS_TOKEN);
    if (!refreshToken && !accessToken) {
      this.logger.error(`To get started, you need to log in to google`);
      this.logger.error(`Please fill in the variables in the .env file`);
      this.logger.error(
        `And go to this endpoint: ${this.configService.get(
          'HOST_URL',
        )}/oauth/authenticate`,
      );
      return { status: StatusEnum.ERROR };
    }
    return this.gmailService.findAndSaveMessages(
      this.configService.get('LEGAL_EMAIL_ADDRESS'),
    );
  }

  async cancelAbuse(page = 0): Promise<void> {
    this.logger.log(`Run: cancel abuse`);
    const messages = await this.gmailService.findAll(MessageStatus.SAVED, page);

    if (!messages.length) {
      this.logger.log(`Finish: cancel abuse`);
      return;
    }

    await this.legalSenderService.cancelWorker(messages.map((m) => m.url));

    await this.gmailService.updateMessagesStatus(
      messages.map((m) => m.id),
      MessageStatus.SUCCESS,
    );
    return this.cancelAbuse(page);
  }
}
