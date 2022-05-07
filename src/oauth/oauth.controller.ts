import { Controller, Get, Query } from '@nestjs/common';

import { OauthService } from 'src/oauth/oauth.service';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}
  @Get()
  callback(@Query() data: { code: string; scope: string | string[] }) {
    this.oauthService.callback(data.code);
  }

  @Get('authenticate')
  auth() {
    return this.oauthService.setTokens();
  }
}
