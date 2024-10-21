import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { newInjectedPage } from 'fingerprint-injector';
import { parseWithOllama } from 'helper/ai-ollama/ollama';
import { Devices, OperatingSystems } from './enum_type/enum_type_devices';
const { HttpsProxyAgent } = require('https-proxy-agent');
const { width, height } = require('screenz');
const axios = require('axios');
const path = require('path');

@Injectable()
export class CrawlWebPuppeterService {
  private browsers: { [key: string]: Browser } = {}; 
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

  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////

  async openProjectAntidetectBrowser(url: string, quantity: number) {
    const config: any = this.getConfig();
    const profileKeys = config.profiles;

    const screenWidth = width; // Available screen width
    const screenHeight = height; // Available screen height

    const cols = Math.floor(
      screenWidth / (screenWidth / Math.ceil(Math.sqrt(quantity))),
    );
    const windowWidth = Math.floor(screenWidth / cols);
    const windowHeight = Math.floor(
      (screenHeight - 20) / Math.ceil(quantity / cols),
    );

    const windowGap = 10;
    let xPosition = 0;
    let yPosition = 0;

    const launchPromises = []; // Collect all launch promises

    for (let i = 0; i < quantity; i++) {
      const profileKey = profileKeys[i];

      // Set window position and dimensions
      if (yPosition + windowHeight <= screenHeight) {
        launchPromises.push(
          this.launchCustomBrowser(
            profileKey,
            xPosition,
            yPosition,
            windowWidth,
            windowHeight,
            url,
          ),
        );

        // Update xPosition for the next profile window
        xPosition += windowWidth + windowGap;
        if ((i + 1) % cols === 0) {
          xPosition = 0;
          yPosition += windowHeight + windowGap;
        }
      } else {
        console.log(
          `Không thể mở profile "${profileKey}" vì không đủ không gian trên màn hình.`,
        );
        break;
      }
    }

    // Đợi tất cả các cửa sổ trình duyệt được mở
    await Promise.all(launchPromises);
  }

  async launchCustomBrowser(profileKey, x, y, windowWidth, windowHeight, url) {
    if (!profileKey) {
      throw new Error(`Profile "${profileKey.name}" không tồn tại.`);
    }

    const userDataDir = path.join(__dirname, '../../profiles', profileKey.name);
    const launchOptions = {
      headless: false,
      args: [
        '--hide-crash-restore-bubble',
        `--user-data-dir=${userDataDir}`,
        `--window-size=${windowWidth},${windowHeight}`,
        `--window-position=${x},${y}`,
        '--no-sandbox',
      ],
    };

    if (profileKey.proxy) {
      const { origin: proxyOrigin } = new URL(profileKey.proxy);
      launchOptions.args.push(`--proxy-server=${proxyOrigin}`);
    }
    const browser = await puppeteer.launch(launchOptions);
    this.browsers[profileKey.name] = browser;// lưu phiên trình duyệt
    const page = await browser.newPage();
    await page.setViewport({ width: windowWidth, height: windowHeight });
    if (profileKey.proxy) {
      const { username, password } = new URL(profileKey.proxy);
      await page.authenticate({ username, password });
    }
    if (profileKey.userAgent) {
      await page.setUserAgent(profileKey.userAgent);
    }

    console.log(
      `Chrome profileKey "${profileKey.name}" đang chạy với ip: ${
        (await this.getIP(profileKey.proxy)) ||
        `Chrome profileKey ${profileKey.name} Không có proxy`
      }`,
    );

    await this.loadPage(page, url);
    return browser;
  }

  async loadPage(page, url) {
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      await this.sleep(2000);
      console.log(`Đang truy cập ${url}`);
      // Giả lập nhập thông tin vào các trường (nếu cần)
      // await page.type('#basic_user', 'qhuy.dev@gmail.com');
      // await page.type('#basic_password', '19102003Huydev@');
    } catch (err) {
      console.error(`Lỗi khi truy cập trang: ${err.message}`);
    }
  }

  async getIP(proxy) {
    try {
      const response = await axios.get('https://api.ipify.org?format=json', {
        httpsAgent: new HttpsProxyAgent(proxy),
      });
      return response.data.ip;
    } catch (error) {
      console.log('Lỗi khi lấy IP:', error.message);
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getConfig() {
    const configPath = path.join(
      process.cwd(),
      '/src/crawl_web_puppeter/config/settings.ts',
    );
    return require(configPath);
  }

  async closeProfile(profileNames: string[]) {
    const namesToClose = profileNames.length > 0 ? profileNames : Object.keys(this.browsers);

    namesToClose.forEach(async (name) => {
      const browser = this.browsers[name];
      if (browser) {
        await browser.close();
        delete this.browsers[name];
        console.log(`Đã đóng profile: ${name}`);
      } else {
        console.log(`Profile "${name}" không có phiên trình duyệt nào đang chạy.`);
      }
    });
  }
}
