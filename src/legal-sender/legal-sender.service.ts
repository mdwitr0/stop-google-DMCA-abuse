import * as puppeteer from 'puppeteer';

import {
  ButtonEnum,
  CheckboxEnum,
  DivEnum,
  FieldEnum,
  OriginatorFieldEnum,
  RadioButtonEnum,
  SelectorEnum,
} from 'src/legal-sender/legal-sender.enum';
import { Injectable, Logger } from '@nestjs/common';

import { BrowserService } from 'src/browser/browser.service';
import { ConfigService } from '@nestjs/config';

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

  async cancelWorker(links: string[]): Promise<{ status: string }> {
    this.logger.log(`Run: filling out the legal form. Links ${links.length}`);

    const page = await this.browserService.init();

    await page.goto(this.baseURL + this.supportUrlPrefix);

    await page.waitForSelector(DivEnum.COUNTRY);
    await page.select(
      SelectorEnum.COUNTRY,
      this.configService.get('COUNTRY_NAME'),
    );

    const reasonIndex = Number(this.configService.get('REASON')) - 1;
    const reasonRadioButtons = await page.$$(RadioButtonEnum.REASON);

    await reasonRadioButtons[reasonIndex].click();

    await this.setOriginatorValues(page);

    await this.setLinksValue(page, links);

    await page.click(CheckboxEnum.CONSENT_1);
    await page.waitForTimeout(this.waitTime);
    await page.click(CheckboxEnum.CONSENT_2);
    await page.waitForTimeout(this.waitTime);

    await page.click(ButtonEnum.SUBMIT);
    await page.waitForTimeout(this.waitTime);

    await page.waitForSelector(DivEnum.CONFIRMATION);
    await page.waitForTimeout(this.waitTime * 4);
    await this.browserService.close();
    this.logger.log(`Finish: filling out the legal form`);
    return {
      status: 'success',
    };
  }

  async setOriginatorValues(page: puppeteer.Page): Promise<void> {
    for (const field in OriginatorFieldEnum) {
      await this.setFieldValue(
        page,
        OriginatorFieldEnum[field],
        this.configService.get(field),
      );
    }
  }

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

    const linkFields = await page.$$(FieldEnum.LINK);
    for (const [index, link] of linkFields.entries()) {
      await link.click();
      await page.waitForTimeout(this.waitTime);
      await link.type(links[index]);
      this.logger.debug(`Set link: ${links[index]}`);
    }

    this.logger.debug(`Finish: set links`);
  }

  async addLinkField(page: puppeteer.Page): Promise<void> {
    await page.click(ButtonEnum.ADD_LINK);
  }
}
