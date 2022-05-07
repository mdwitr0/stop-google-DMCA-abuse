import * as fs from 'fs';

import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'googleapis-common';
import { google } from 'googleapis';

@Injectable()
export class OauthService {
  private logger = new Logger(OauthService.name);
  private oauth2Client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    const redirectUri = this.configService.get('HOST_URL') + '/oauth';

    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get('CLIENT_ID'),
      this.configService.get('CLIENT_SECRET'),
      redirectUri,
    );
    const tokens = fs.readFileSync('oauth2.keys.json', 'utf8');
    const tokenJson = JSON.parse(tokens);
    if (tokens) {
      this.oauth2Client.setCredentials(tokenJson);
      this.logger.log(`Success set credentials: oauth2.keys.json`);
    } else {
      this.logger.warn(`Not fount: oauth2.keys.json`);
    }
  }

  setTokens() {
    this.logger.log('Set tokens.');

    google.options({ auth: this.oauth2Client });
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });

    return {
      url,
    };
  }

  async callback(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    fs.writeFileSync('oauth2.keys.json', JSON.stringify(tokens), 'utf-8');
  }

  get credentials() {
    return this.oauth2Client.credentials;
  }
}
