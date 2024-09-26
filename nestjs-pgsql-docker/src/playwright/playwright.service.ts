import { Injectable } from '@nestjs/common';
import * as FingerprintJS from '@fingerprintjs/fingerprintjs';
import { chromium, Browser, Page } from 'playwright';

@Injectable()
export class PlaywrightService {
  private browser: Browser;

  constructor() {}

  async initBrowser() {
    this.browser = await chromium.launch({ headless: false });
  }

  async getFingerprint(url: string) {
    const page: Page = await this.browser.newPage();
    await page.goto(url);
    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise;
    const fingerprint = await fp.get();
    await page.close();
    return fingerprint.visitorId;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
