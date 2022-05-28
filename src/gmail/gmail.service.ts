import { Injectable, Logger } from '@nestjs/common';
import { MessageStatus, Messages } from '@prisma/client';
import { gmail_v1, google } from 'googleapis';

import { ConfigService } from '@nestjs/config';
import { OauthService } from 'src/oauth/oauth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatusEnum } from 'src/common/enums/status';

@Injectable()
export class GmailService {
  private readonly logger = new Logger();

  private maxResults = 100;
  private userId = 'me';

  private lumenDbRegexp = /lumendatabase\.org/;
  private domain: string = this.configService.get('DOMAIN');
  private domainRegexp = RegExp(`http.*\/\/${this.domain}\/.*[^]`, 'g');

  constructor(
    private readonly configService: ConfigService,
    private readonly oauthService: OauthService,
    private readonly prisma: PrismaService,
  ) {}

  get gmail(): gmail_v1.Gmail {
    return google.gmail({
      version: 'v1',
      auth: this.oauthService.client,
    });
  }

  async getEmails(
    q: string,
    pageToken: string,
  ): Promise<gmail_v1.Schema$ListMessagesResponse> {
    const response = await this.gmail.users.messages.list({
      userId: this.userId,
      maxResults: this.maxResults,
      q,
      pageToken,
    });

    return response.data;
  }

  async getMessage(id: string): Promise<string> {
    const message = await this.gmail.users.messages.get({
      userId: this.userId,
      id,
    });

    return Buffer.from(
      message.data.payload.parts[0].body.data,
      'base64',
    ).toString();
  }

  async findAndSaveMessages(
    q: string,
    nextPageToken?: string,
  ): Promise<{ status: StatusEnum }> {
    this.logger.log(`Run: set messages`);

    const list = await this.getEmails(q, nextPageToken);
    this.logger.log(
      `Process: ${list.messages.length} messages found in the list`,
    );

    for (const messageData of list.messages) {
      const savedMessage = await this.prisma.messages.findUnique({
        where: { messageId: messageData.id },
      });

      if (savedMessage) {
        this.logger.debug(`Found message: ${messageData.id}`);
      } else {
        this.logger.debug(`Get message: ${messageData.id}`);

        const message = await this.getMessage(messageData.id);

        const links = message.match(this.domainRegexp);
        const isAbuse = this.lumenDbRegexp.test(message);
        if (isAbuse && links?.length) {
          const data = {
            messageId: messageData.id,
            url: links[1].trim(),
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

    if (list.nextPageToken) this.findAndSaveMessages(q, list.nextPageToken);

    this.logger.log(`Finish: all messages are saved`);

    return { status: StatusEnum.SUCCESS };
  }

  async findAll(
    status: MessageStatus,
    page: number,
    take = 50,
  ): Promise<Messages[]> {
    return this.prisma.messages.findMany({
      take,
      skip: take * page,
      where: {
        status,
      },
    });
  }

  async updateMessagesStatus(
    ids: string[],
    status: MessageStatus,
  ): Promise<{ status: StatusEnum }> {
    await this.prisma.messages.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status,
      },
    });
    return { status: StatusEnum.SUCCESS };
  }
}
