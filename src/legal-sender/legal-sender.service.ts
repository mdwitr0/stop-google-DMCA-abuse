import * as puppeteer from 'puppeteer';

import { Injectable, Logger } from '@nestjs/common';

import { BrowserService } from 'src/browser/browser.service';
import { ConfigService } from '@nestjs/config';
import { FieldsEnum } from 'src/common/enums/felds.enum';

@Injectable()
export class LegalSenderService {
  private readonly logger = new Logger(LegalSenderService.name);

  private readonly waitTime = 250;
  private readonly baseURL = 'https://support.google.com';
  private readonly supportUrlPrefix =
    '/legal/contact/lr_counternotice?product=websearch';

  constructor(
    private readonly browserService: BrowserService,
    private readonly configService: ConfigService,
  ) {}

  async setFieldValue(
    page: puppeteer.Page,
    selector: string,
    text: string,
  ): Promise<void> {
    this.logger.debug(`Run: set field ${selector}`);

    await page.waitForSelector(selector);
    await page.click(selector);
    await page.waitForTimeout(this.waitTime);

    await page.type(selector, text);
    this.logger.debug(`Finish: set field ${selector}`);
  }

  async setLinksValue(page: puppeteer.Page, links: string[]): Promise<void> {
    this.logger.debug(`Run: set links`);

    for (let index = 1; index <= links.length - 1; index++) {
      await this.addLinkField(page);
    }

    const linkFields = await page.$$('[name="material_location"]');
    for (const [index, link] of linkFields.entries()) {
      await link.click();
      await page.waitForTimeout(this.waitTime);
      await link.type(links[index]);
      this.logger.debug(`Set link: ${links[index]}`);
    }

    this.logger.debug(`Finish: set links`);
  }

  async addLinkField(page: puppeteer.Page): Promise<void> {
    await page.click('[class="add-additional"]');
  }

  async cancelWorker(links: string[]): Promise<{ status: string }> {
    this.logger.log(`Run: filling out the legal form. Links ${links.length}`);

    const page = await this.browserService.init();

    await page.goto(this.baseURL + this.supportUrlPrefix);

    await page.waitForSelector('[class="sc-select"]');
    await page.select(
      '[name="market_residence"]',
      this.configService.get('COUNTRY_NAME'),
    );

    const reasonIndex = Number(this.configService.get('REASON')) - 1;
    const reasonRadioButtons = await page.$$(
      '[data-frd-context-type="TYPE_UNSPECIFIED"] [aria-labelledby="dmca_clarifications_intro--label"] [class="material-radio__circle"]',
    );

    await reasonRadioButtons[reasonIndex].click();

    for (const field in FieldsEnum) {
      await this.setFieldValue(
        page,
        `[id="${FieldsEnum[field]}"]`,
        this.configService.get(field),
      );
    }

    await this.setLinksValue(page, links);

    await page.click('[name="consent_statement1"]');
    await page.click('[name="consent_statement2"]');
    await page.waitForTimeout(this.waitTime);

    await page.click('.submit-button');
    await page.waitForTimeout(this.waitTime);

    await this.browserService.close();
    this.logger.log(`Finish: filling out the legal form`);
    return {
      status: 'success',
    };
  }
}
