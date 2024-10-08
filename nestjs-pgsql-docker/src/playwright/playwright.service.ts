import { Injectable } from '@nestjs/common';
import { chromium } from 'playwright-extra'; // Import Chromium từ playwright-extra
const StealthPlugin = require('puppeteer-extra-plugin-stealth'); // Import plugin stealth

@Injectable()
export class PlaywrightService {
  private browser;
  private page;

  constructor() {
    // Sử dụng plugin stealth
    chromium.use(StealthPlugin());
  }

  async launchBrowser(): Promise<void> {
    // Sử dụng phiên bản Chrome thay vì Chromium
    const executablePath =
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    this.browser = await chromium.launch({
      headless: false,
      executablePath: executablePath, // Sử dụng Chrome chính thức
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--allow-insecure-localhost',
        '--disable-extensions',
        '--window-size=1920,1080',
        '--disable-infobars',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    this.page = await this.browser.newPage();

    // Thay đổi Accept-Language
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Thay đổi kích thước cửa sổ và vị trí chuột
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await this.page.mouse.move(100, 100);
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async navigate(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not launched');
    }
    await this.page.goto(url);
  }
}
