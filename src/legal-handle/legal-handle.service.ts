import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { GmailService } from 'src/gmail/gmail.service';
import { LegalSenderService } from 'src/legal-sender/legal-sender.service';
import { MessageStatus } from '@prisma/client';
import { StatusEnum } from 'src/common/enums/status';

@Injectable()
export class LegalHandleService {
  private readonly logger = new Logger(LegalHandleService.name);
  constructor(
    private readonly gmailService: GmailService,
    private readonly configService: ConfigService,
    private readonly legalSenderService: LegalSenderService,
  ) {}

  async messageUpdate(): Promise<{ status: StatusEnum }> {
    return this.gmailService.findAndSaveMessages(
      this.configService.get('LEGAL_EMAIL_ADDRESS'),
    );
  }

  async cancelAbuse(page = 1): Promise<void> {
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
