import * as fs from 'fs';

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'googleapis-common';
import { OAuthKeys } from 'src/oauth/oauth.enum';
import { SettingService } from 'src/setting/setting.service';
import { google } from 'googleapis';
import { string } from 'joi';

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
      prompt: 'consent',
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

    if (tokens.refresh_token) {
      await this.settingService.set(
        OAuthKeys.REFRESH_TOKEN,
        tokens.refresh_token,
        {
          second: 60 * 60 * 60 * 60,
        },
      );
    }

    await this.settingService.set(OAuthKeys.ACCESS_TOKEN, tokens.access_token, {
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
      const refreshTokenObj = await this.settingService.get(
        OAuthKeys.REFRESH_TOKEN,
      );
      const accessTokenObj = await this.settingService.get(
        OAuthKeys.REFRESH_TOKEN,
      );

      const credentials: any = {
        token_type: 'Bearer',
      };
      if (accessTokenObj) credentials.access_token = accessTokenObj.value;

      if (refreshTokenObj) credentials.refresh_token = refreshTokenObj.value;

      if (Object.keys(credentials).length) {
        this.oauth2Client.setCredentials(credentials);

        this.logger.log(`Success set credentials`);
      } else {
        this.logger.warn(`Not fount: oauth keys`);
      }
    } catch (error) {
      this.logger.warn(`Not fount: oauth keys`);
    }
  }
}
