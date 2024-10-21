import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { newInjectedPage } from 'fingerprint-injector';
import { parseWithOllama } from 'helper/ai-ollama/ollama';
import { Devices, OperatingSystems } from './enum_type/enum_type_devices';
import * as fs from 'fs';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import dayjs from 'dayjs';
const { HttpsProxyAgent } = require('https-proxy-agent');
const { width, height } = require('screenz');
const axios = require('axios');

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
    const config: any = await this.getConfig();
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
    this.browsers[profileKey.name] = browser; // lưu phiên trình duyệt
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
      `Chrome profile "${profileKey.name}" đang chạy với ip: ${
        (await this.getIP(profileKey.proxy)) ||
        `Chrome profile ${profileKey.name} Không có proxy`
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
      // await page.type('#basic_user', 'outland.dev@gmail.com');
      // await page.type('#basic_password', 'outland1231');
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

  async getConfig() {
    const configPath = path.join(
      process.cwd(),
      '/src/crawl_web_puppeter/config/settings.ts',
    );
    return require(configPath);
  }

  async closeProfile(profileNames: string[]) {
    const namesToClose =
      profileNames.length > 0 ? profileNames : Object.keys(this.browsers);

    namesToClose.forEach(async (name) => {
      const browser = this.browsers[name];
      if (browser) {
        await browser.close();
        delete this.browsers[name];
        console.log(`Đã đóng profile: ${name}`);
      } else {
        console.log(
          `Profile "${name}" không có phiên trình duyệt nào đang chạy.`,
        );
      }
    });
  }

  async copyChromeProfile(profileName?: string) {
    const usersPath = path.join('C:', 'Users');

    // Filter out folders containing Chrome profiles
    const userDirs = fs.readdirSync(usersPath).filter((user) => {
      const userDataPath = path.join(
        usersPath,
        user,
        'AppData',
        'Local',
        'Google',
        'Chrome',
        'User Data',
      );
      return fs.existsSync(userDataPath);
    });

    if (userDirs.length === 0) {
      throw new Error('Không tìm thấy bất kỳ profile Chrome nào.');
    }

    // Use the profile of the first user found
    const chromeBasePath = path.join(
      usersPath,
      userDirs[0],
      'AppData',
      'Local',
      'Google',
      'Chrome',
      'User Data',
    );

    const timestamp = dayjs().format('DDMMYYYY_HHmm');
    const newProfileName = profileName || `profile_${timestamp}`;
    const destination = path.join(process.cwd(), 'profiles', newProfileName);

    const itemsToCopy = [
      'Default',
      'GraphiteDawnCache',
      'GrShaderCache',
      'Safe Browsing',
      'segmentation_platform',
      'ShaderCache',
      'ChromeFeatureState',
      'DevToolsActivePort',
      'first_party_sets.db',
      'first_party_sets.db-journal',
      'Last Version',
      'Local State',
      'RunningChromeVersion',
      'SingletonCookie',
      'SingletonLock',
      'SingletonSocket',
      'Variations',
    ];

    try {
      await fsExtra.ensureDir(destination);

      for (const item of itemsToCopy) {
        const sourcePath = path.join(chromeBasePath, item);
        const destPath = path.join(destination, item);

        if (fs.existsSync(sourcePath)) {
          const stat = fs.lstatSync(sourcePath);

          try {
            if (stat.isDirectory()) {
              // Copy the entire folder
              await fsExtra.copy(sourcePath, destPath);
            } else {
              // Copy files
              await fsExtra.copyFile(sourcePath, destPath);
            }
            console.log(`Đã sao chép: ${item}`);
          } catch (error) {
            if (error.code === 'EBUSY') {
              console.warn(`Bỏ qua tệp đang bị khóa: ${sourcePath}`);
            } else {
              console.error(`Lỗi khi sao chép ${item}:`, error);
              throw error; // Throw error if not EBUSY
            }
          }
        } else {
          console.warn(`Không tìm thấy: ${item}`);
        }
      }

      console.log(`Profile được lưu vào: ${destination}`);
      return { success: true, message: `Profile copied to ${destination}` };
    } catch (error) {
      console.error('Lỗi khi sao chép profile:', error);
      throw new Error('Không thể sao chép profile.');
    }
  }
}
