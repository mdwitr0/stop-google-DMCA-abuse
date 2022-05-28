import { ConfigService } from '@nestjs/config';
import { GmailService } from 'src/gmail/gmail.service';
import { Injectable } from '@nestjs/common';
import { LegalHandleService } from 'src/legal-handle/legal-handle.service';

@Injectable()
export class AppService {
  constructor(
    private readonly legalHandleService: LegalHandleService,
    private readonly configService: ConfigService,
    private readonly gmailService: GmailService,
  ) {}

  async findAbuse() {
    return this.gmailService.findAndSaveMessages(
      this.configService.get('LEGAL_EMAIL_ADDRESS'),
    );
  }

  async cancelAbuse() {
    return this.legalHandleService.cancelAbuse();
  }
}
