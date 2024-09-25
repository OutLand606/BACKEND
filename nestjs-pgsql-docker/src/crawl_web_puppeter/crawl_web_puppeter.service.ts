import { Injectable } from '@nestjs/common';
import puppeteer, { Page } from 'puppeteer';
import { newInjectedPage } from 'fingerprint-injector';
import { parseWithOllama } from 'helper/ai-ollama/ollama';
import { Devices, OperatingSystems } from './enum_type/enum_type_devices';

import { connect } from 'puppeteer-real-browser';

@Injectable()
export class CrawlWebPuppeterService {
  async crawlDtaWebFingerPrint(url: string, parse_description: string) {
    let data;
    const browser = await puppeteer.launch({ headless: true });
    const page = await newInjectedPage(browser, {
      fingerprintOptions: {
        devices: [await this.getRandomDevice(Object.values(Devices))],
        operatingSystems: [
          await this.getRandomDevice(Object.values(OperatingSystems)),
        ],
      },
    });
    await page.goto(url, { waitUntil: 'networkidle2' });
    const cleanedContent = await this.cleanContent(page);
    data = await parseWithOllama(cleanedContent, parse_description);
    await browser.close();
    return data;
  }

  async cleanContent(page: Page, chunkSize: number = 1000) {
    return page.evaluate((chunkSize) => {
      document.querySelectorAll('script, style').forEach((el) => el.remove());
      let textContent = document.body.innerText.replace(/\s+/g, ' ').trim();
      const chunks = [];
      for (let i = 0; i < textContent.length; i += chunkSize) {
        chunks.push(textContent.substring(i, i + chunkSize));
      }
      return chunks;
    }, chunkSize);
  }

  async getRandomDevice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async openNewDtaWebFingerPrint(url: string) {
    const { page, browser }: any = await connect({
      args: [],
      turnstile: true,
      headless: false,
      customConfig: {},
      connectOption: {
        defaultViewport: null,
      },
      // proxy:{
      //     host:'<proxy-host>',
      //     port:'<proxy-port>',
      //     username:'<proxy-username>',
      //     password:'<proxy-password>'
      // }
      // plugins: [require('puppeteer-extra-plugin-click-and-wait')()],
    });

    // await page.goto("https://google.com", { waitUntil: "domcontentloaded" })
    // await page.clickAndWaitForNavigation('body')

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for the search textarea to appear using the known id or name attribute
    await page.waitForSelector('textarea[name="q"]');

    // Click on the search bar
    await page.click('textarea[name="q"]');

    // Type the search query (you can replace 'Your search query' with the actual query)
    await page.type('textarea[name="q"]', 'chữ ký hay chữ kí', { delay: 100 });

    // Press 'Enter' to start the search
    await page.keyboard.press('Enter');

    // Wait for the page to navigate after search
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    // await browser.close();
  }
}
