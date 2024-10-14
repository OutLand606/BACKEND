import { Injectable } from '@nestjs/common';
import puppeteer, { Page } from 'puppeteer';
import { newInjectedPage } from 'fingerprint-injector';
import { parseWithOllama } from 'helper/ai-ollama/ollama';
import { Devices, OperatingSystems } from './enum_type/enum_type_devices';
const { HttpsProxyAgent } = require('https-proxy-agent');
const { width, height } = require('screenz');
const axios = require('axios');
const path = require('path');

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

  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////

  async openAllProjectAntidetectBrowser(url: string) {
    const config: any = this.getConfig();
    console.log('config', config);
    const profileKeys = Object.keys(config.profiles);

    const screenWidth = width; // Available screen width
    const screenHeight = height; // Available screen height
    const numProfiles = profileKeys.length;
    const cols = Math.floor(
      screenWidth / (screenWidth / Math.ceil(Math.sqrt(numProfiles))),
    );
    const windowWidth = Math.floor(screenWidth / cols);
    const windowHeight = Math.floor(
      (screenHeight - 20) / Math.ceil(numProfiles / cols),
    );

    const windowGap = 10;
    let xPosition = 0;
    let yPosition = 0;

    const launchPromises = []; // Collect all launch promises

    for (let i = 0; i < numProfiles; i++) {
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
    const config: any = this.getConfig();
    const profile = config.profiles[profileKey];

    if (!profile) {
      throw new Error(`Profile "${profileKey}" không tồn tại.`);
    }

    console.log('Profile:', profile);
    console.log('Profile Name:', profile.name);

    const userDataDir = path.join(__dirname, '../../profiles', profileKey);
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

    if (profile.proxy) {
      const { origin: proxyOrigin } = new URL(profile.proxy);
      launchOptions.args.push(`--proxy-server=${proxyOrigin}`);
    }
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setViewport({ width: windowWidth, height: windowHeight });
    if (profile.proxy) {
      const { username, password } = new URL(profile.proxy);
      await page.authenticate({ username, password });
    }
    if (profile.userAgent) {
      await page.setUserAgent(profile.userAgent);
    }

    console.log(
      `Chrome profile "${profile.name}" đang chạy với ip: ${
        (await this.getIP(profile.proxy)) ||
        `Chrome profile ${profile.name} Không có proxy`
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
      await page.type('#basic_user', 'qhuy.dev@gmail.com');
      await page.type('#basic_password', '19102003Huydev@');
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
      '/src/crawl_web_puppeter/config/settings.js',
    );
    console.log('configPath', configPath);
    return require(configPath);
  }
}
