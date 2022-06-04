import * as puppeteer from 'puppeteer';

import { Injectable } from '@nestjs/common';

@Injectable()
export class BrowserService {
  private browser: puppeteer.Browser;
  private browserConfig: puppeteer.LaunchOptions &
    puppeteer.BrowserLaunchArgumentOptions &
    puppeteer.BrowserConnectOptions & {
      product?: puppeteer.Product;
      extraPrefsFirefox?: Record<string, unknown>;
    } = {
    headless: false,
    product: 'chrome',
    waitForInitialPage: true,
    defaultViewport: {
      height: 1080,
      width: 1920,
    },
  };

  async init(): Promise<puppeteer.Page> {
    this.browser = await puppeteer.launch(this.browserConfig);

    const browserPage = await this.browser.newPage();

    return browserPage;
  }

  async close() {
    await this.browser.close();
  }
}
