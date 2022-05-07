import * as fs from 'fs';

import { Injectable } from '@nestjs/common';
import { OauthService } from 'src/oauth/oauth.service';
import { google } from 'googleapis';

@Injectable()
export class GmailService {
  constructor(private readonly oauthService: OauthService) {}

  async getMessages(q: string) {
    const gmail = google.gmail({
      version: 'v1',
      auth: this.oauthService.client,
    });
    const list = await gmail.users.messages.list({
      userId: 'me',
      q,
      maxResults: 10000,
    });

    const messages = [];
    for (const messageData of list.data.messages) {
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: messageData.id,
      });

      messages.push(
        Buffer.from(
          message.data.payload.parts[0].body.data,
          'base64',
        ).toString(),
      );
    }

    return messages;
  }

  async onModuleInit() {
    this.getMessages('sc-noreply@google.com');
  }
}
