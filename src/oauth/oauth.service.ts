import * as fs from 'fs';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'googleapis-common';
import { OAuthKeys } from 'src/oauth/oauth.enum';
import { SettingService } from 'src/setting/setting.service';
import { google } from 'googleapis';

@Injectable()
export class OauthService implements OnModuleInit {
  private logger = new Logger(OauthService.name);
  private oauth2Client: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly settingService: SettingService,
  ) {}

  setTokens() {
    this.logger.log('Set tokens.');

    google.options({ auth: this.oauth2Client });
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });

    this.logger.verbose(`Please: open the link: ${url}`);

    return {
      url,
    };
  }

  async callback(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    await this.settingService.set(OAuthKeys.TOKENS, tokens, {
      date: tokens.expiry_date,
    });
  }

  get client() {
    return this.oauth2Client;
  }

  async onModuleInit() {
    const redirectUri = this.configService.get('HOST_URL') + '/oauth';

    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get('CLIENT_ID'),
      this.configService.get('CLIENT_SECRET'),
      redirectUri,
    );
    try {
      const tokens = await this.settingService.get(OAuthKeys.TOKENS);
      const tokenJson: any = tokens.value;
      if (tokens) {
        this.oauth2Client.setCredentials(tokenJson);
        this.logger.log(`Success set credentials: oauth2.keys.json`);
      } else {
        this.logger.warn(`Not fount: oauth keys`);
      }
    } catch (error) {
      this.logger.warn(`Not fount: oauth keys`);
    }
  }
}
