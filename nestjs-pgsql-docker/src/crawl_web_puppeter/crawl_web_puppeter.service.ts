import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { newInjectedPage } from 'fingerprint-injector';
import { parseWithOllama } from 'helper/ai-ollama/ollama';

@Injectable()
export class CrawlWebPuppeterService {
  async crawlDtaWebFingerPrint(url: string, parse_description: string) {
    let data;
    const devices = ['desktop', 'mobile'];
    const operatingSystems = ['windows', 'macos', 'linux', 'android', 'ios'];
    const browser = await puppeteer.launch({ headless: true });
    const page = await newInjectedPage(browser, {
      fingerprintOptions: {
        devices: [await this.getRandomDevice(devices)],
        operatingSystems: [await this.getRandomDevice(operatingSystems)],
      },
    });
    await page.goto(url, { waitUntil: 'networkidle2' });
    const cleanedContent = await this.cleanContent(page);
    data = await parseWithOllama(cleanedContent, parse_description);
    await browser.close();
    return data
  }

  async cleanContent(page) {
    return page.evaluate(() => {
      document.querySelectorAll('script, style').forEach((el) => el.remove());
      let textContent = document.body.innerText.replace(/\s+/g, ' ').trim();
      const chunkSize = 6000;
      const chunks = [];
      for (let i = 0; i < textContent.length; i += chunkSize) {
        chunks.push(textContent.substring(i, i + chunkSize));
      }
      return chunks;
    });
  }

  async getRandomDevice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
