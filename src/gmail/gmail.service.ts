import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { OauthService } from 'src/oauth/oauth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { google } from 'googleapis';

@Injectable()
export class GmailService {
  private readonly logger = new Logger();

  constructor(
    private readonly configService: ConfigService,
    private readonly oauthService: OauthService,
    private readonly prisma: PrismaService,
  ) {}

  async findAndSaveMessages(q: string, nextPageToken?: string): Promise<any> {
    this.logger.log(`Run: set messages`);

    const gmail = google.gmail({
      version: 'v1',
      auth: this.oauthService.client,
    });
    const list = await gmail.users.messages.list({
      userId: 'me',
      q,
      maxResults: 100,
      pageToken: nextPageToken,
    });

    this.logger.log(
      `Process: ${list.data.messages.length} messages found in the list`,
    );

    for (const messageData of list.data.messages) {
      const savedMessage = await this.prisma.messages.findUnique({
        where: { messageId: messageData.id },
      });

      if (savedMessage) {
        this.logger.debug(`Found message: ${messageData.id}`);
      } else {
        this.logger.debug(`Get message: ${messageData.id}`);

        const message = await gmail.users.messages.get({
          userId: 'me',
          id: messageData.id,
        });

        const messageText = Buffer.from(
          message.data.payload.parts[0].body.data,
          'base64',
        ).toString();

        const domain = this.configService.get('DOMAIN');
        const links = messageText.match(
          RegExp(`http.*\/\/${domain}\/.*[^]`, 'g'),
        );
        const isAbuse = /lumendatabase\.org/.test(messageText);
        if (isAbuse && links?.length) {
          const data = {
            messageId: message.data.id,
            url: links[1],
          };

          await this.prisma.messages.create({
            data,
          });

          this.logger.debug(`Save message: ${messageData.id}`);
        } else {
          this.logger.debug(
            `Skip message: ${messageData.id}, It doesn't meet the criteria`,
          );
        }
      }
    }

    if (list.data.nextPageToken)
      this.findAndSaveMessages(q, list.data.nextPageToken);

    this.logger.log(`Finish: all messages are saved`);

    return { status: 'success' };
  }
}
