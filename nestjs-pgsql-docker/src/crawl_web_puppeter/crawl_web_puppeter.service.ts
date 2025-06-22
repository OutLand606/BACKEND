import { BadRequestException, Injectable } from '@nestjs/common';
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
import { Readable } from 'stream';
import * as readline from 'readline';
import { connect } from 'puppeteer-real-browser';
import proxies from '../../uploads/proxies.json';
import userAgents from '../../uploads/userAgents.json';
import account from '../../uploads/account.json';
import { SocksProxyAgent } from 'socks-proxy-agent';


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
  async openProFileAntidetectBrowser(url: string, quantity: number) {
    const profiles = this.loadProfiles();
    const finalQuantity = Math.min(
      quantity || profiles.length,
      profiles.length,
    );
    const { windowWidth, windowHeight, cols } =
      this.calculateWindowLayout(finalQuantity);

    const launchPromises = profiles
      .slice(0, finalQuantity)
      .map((profile, index) => {
        const x = (index % cols) * (windowWidth + 5);
        const y = Math.floor(index / cols) * (windowHeight + 5);
        if (y + windowHeight > height) {
          console.log(
            `Không thể mở profile "${profile.name}" vì không đủ không gian trên màn hình.`,
          );
          return Promise.resolve();
        }
        return this.launchBrowserInstance(
          profile,
          x,
          y,
          windowWidth,
          windowHeight,
          url,
        );
      });

    await Promise.all(launchPromises);
    return this.browsers;
  }

  // Load and declare data profile
  private loadProfiles() {
    const profilesDir = path.resolve(__dirname, '../../../profiles');
    const folderNames = fs
      .readdirSync(profilesDir)
      .filter((file) =>
        fs.statSync(path.join(profilesDir, file)).isDirectory(),
      );

    return folderNames.map((_, index) => {
      const folderName = this.getRandomElement(folderNames); // Random folderName
      return {
        id: (index + 1).toString(),
        name: folderName,
        proxy: this.getRandomElement(proxies),
        userAgent: this.getRandomElement(userAgents),
      };
    });
  }

  // windows Size
  private calculateWindowLayout(quantity: number) {
    const SCREEN_WIDTH = width;
    const SCREEN_HEIGHT = height;
    const cols = Math.ceil(Math.sqrt(quantity));
    const windowWidth = Math.floor(SCREEN_WIDTH / cols);
    const rows = Math.ceil(quantity / cols);
    const windowHeight = Math.floor((SCREEN_HEIGHT - (rows - 1) * 5) / rows);
    return { windowWidth, windowHeight, cols };
  }

  async launchBrowserInstance(profile, x, y, windowWidth, windowHeight, url) {
    const userDataDir = path.join(__dirname, '../../profiles', profile.name);

    const args = [
      '--hide-crash-restore-bubble',
      `--user-data-dir=${userDataDir}`,
      `--window-size=${windowWidth},${windowHeight}`,
      `--window-position=${x},${y}`,
      '--no-sandbox',
    ];

    // Check and inner proxy to args
    if (profile.proxy) {
      args.push(`--proxy-server=${new URL(profile.proxy).origin}`);
    }

    // Check extension in folder
    const extensionsDir = path.join(process.cwd(), 'extensions');

    // Check list extension
    const extensionDirs = fs.readdirSync(extensionsDir).filter((file) => {
      const fullPath = path.join(extensionsDir, file);
      return fs.statSync(fullPath).isDirectory(); // Chỉ chọn các thư mục
    });

    // inner args
    if (extensionDirs.length > 0) {
      const extensionPaths = extensionDirs.map((dir) =>
        path.join(extensionsDir, dir),
      );
      const extensionPathsString = extensionPaths.join(',');
      args.push(`--disable-extensions-except=${extensionPathsString}`);
      args.push(`--load-extension=${extensionPathsString}`);
      console.log(
        `Đang cài đặt extension từ các thư mục: ${extensionPaths.join(', ')}`,
      );
    }

    try {
      // // Start browser
      // const browser = await puppeteer.launch({ headless: false, args });
      // const nameProfile = profile.name;
      // this.browsers[nameProfile] = browser;

      // const page = await browser.newPage();
      // await page.setViewport({ width: windowWidth, height: windowHeight });

      // // Login proxy
      // if (profile.proxy) {
      //   const { username, password } = new URL(profile.proxy);
      //   await page.authenticate({ username, password });
      // }

      // // Set UserAgent
      // if (profile.userAgent) {
      //   await page.setUserAgent(profile.userAgent);
      // }

      // console.log(
      //   `Chrome profile "${profile.name}" đang chạy với IP: ${(await this.getIP(profile.proxy)) || 'Không có proxy'}`,
      // );

      // // Goto URL
      // await page.goto(url, { waitUntil: 'networkidle2' });
      // console.log(`Đang truy cập ${url}`);

      /////////////////////////////////////////////////////
      /////////////////////////////////////////////////////

      // ADD BUYPASS CLOUDFLARE
      const { browser, page } = await connect({
        headless: false,
        args: args,
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false,
        // proxy: {
        //   host: '13t9mmnc1.proxy7773.cloud',
        //   port: '3130',
        //   username: 'fqn38wjh',
        //   password: 'OPMDNNuyy7xX',
        // } as any,
      });

      const timestamp = dayjs().format('YYYYMMDD_HHmmss'); // format: 20241115_143507
      const nameProfile = `${profile.name}_${timestamp}`;
      this.browsers[nameProfile] = browser as any;

      await page.setViewport({ width: windowWidth, height: windowHeight });

      // Login proxy
      if (profile.proxy) {
        const { username, password } = new URL(profile.proxy);
        await page.authenticate({ username, password });
      }

      // Set UserAgent
      if (profile.userAgent) {
        await page.setUserAgent(profile.userAgent);
      }

      console.log(
        `Chrome profile "${profile.name}" đang chạy với IP: ${(await this.getIP(profile.proxy)) || 'Không có proxy'}`,
      );

      // Goto URL
      await page.goto(url, { waitUntil: 'networkidle2' });
      console.log(`Đang truy cập ${url}`);

      return { nameProfile, browser, page };
    } catch (err) {
      console.error(
        `Lỗi khi khởi động trình duyệt cho profile "${profile.name}": ${err.message}`,
      );
    }
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

      console.log(`Profile save in: ${destination}`);
      return { success: true, message: `Profile save to ${destination}` };
    } catch (error) {
      console.error('Lỗi khi sao chép profile:', error);
      throw new Error('Không thể sao chép profile.');
    }
  }

  async runScriptOnProfile(profileNames: string[], scriptsName: string) {
    const namesToRunScript =
      profileNames.length > 0 ? profileNames : Object.keys(this.browsers);

    namesToRunScript.forEach(async (name) => {
      const browser = this.browsers[name];
      const pages = await browser.pages();
      if (pages) {
        try {
          if (scriptsName === 'loginGrass') {
            return await this.loginGrass(pages);
            // await this.getExtension(browser);
          }
          if (scriptsName === 'nodePay') {
            return await this.nodePay(pages);
            // await this.getExtension(browser);
          }
          if (scriptsName === 'roBlox') {
            return await this.roBlox(pages);
            // await this.getExtension(browser);
          }
        } catch (err) {
          console.error(`Lỗi khi chạy script trên profile "${name}":`, err);
        }
      }
    });
  }

  async importFileTxt(file, options) {
    if (!file) {
      throw new BadRequestException('File là bắt buộc!');
    }

    const fileStream = Readable.from(file.buffer);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const lines: string[] = [];
    let filename: string | null = null;

    for await (const line of rl) {
      const trimmedLine = line.trim();

      switch (options) {
        case 'proxies':
          if (!trimmedLine.includes('http')) {
            throw new BadRequestException(
              'Invalid data file proxy! The data stream must be structured as http://username:pass@ip:port',
            );
          }
          filename = 'proxies.json';
          break;

        case 'account':
          if (!/^.+:.+$/.test(trimmedLine)) {
            throw new BadRequestException(
              'Invalid data file account! The data stream must be structured as (username || email):pass',
            );
          }
          filename = 'account.json';
          break;

        // Thêm case khác nếu cần mở rộng
        default:
          throw new BadRequestException('Unsupported option provided!');
      }

      lines.push(trimmedLine);
    }

    // Kiểm tra nếu không có filename được đặt (dự phòng)
    if (!filename) {
      throw new BadRequestException('Options are invalid!');
    }

    const jsonPath = path.join(process.cwd(), 'uploads', filename);
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });

    // Kiểm tra file có tồn tại không
    if (fs.existsSync(jsonPath)) {
      // Nếu file tồn tại, đọc nội dung cũ và thêm dữ liệu mới
      const existingData = JSON.parse(
        fs.readFileSync(jsonPath, 'utf-8') || '[]',
      );
      const mergedData = [...existingData, ...lines];
      fs.writeFileSync(jsonPath, JSON.stringify(mergedData, null, 2));
    } else {
      // Nếu file chưa tồn tại, tạo mới và ghi dữ liệu
      fs.writeFileSync(jsonPath, JSON.stringify(lines, null, 2));
    }

    return jsonPath;
  }

  // Scripts using in page
  async loginGrass(pages) {
    const page = pages[0];

    try {
      console.log('Bắt đầu quá trình đăng nhập vào Grass');
      await this.sleep(1000);

      const usernameSelector = 'input[placeholder="Username or Email"]';
      await this.clearAndType(page, usernameSelector, 'dichmebanga@gmail.com');

      const passwordSelector = 'input[placeholder="Password"]';
      await this.clearAndType(page, passwordSelector, 'Concat1233@');

      await this.sleep(500);
      await page.click('button[type="submit"]');

      console.log('Đăng nhập xong, bắt đầu vòng lặp reload trang...');
      await this.startReloadLoop(page, 7200000);
    } catch (err) {
      console.error('Lỗi khi đăng nhập vào Grass:', err);
    }
  }

  async nodePay(pages) {
    const page = pages[0];

    try {
      console.log('Bắt đầu quá trình đăng nhập vào NodePay');

      await this.sleep(1000);

      const usernameSelector = 'input[placeholder="Username or email"]';
      await this.clearAndType(page, usernameSelector, 'dichmebanga@gmail.com');

      const passwordSelector = 'input[placeholder="Password"]';
      await this.clearAndType(page, passwordSelector, 'Concat1233@');

      await this.sleep(500);
      await page.click('button[type="submit"]');

      console.log('Đăng nhập xong, bắt đầu vòng lặp reload trang...');
      await this.startReloadLoop(page, 7200000);
    } catch (err) {
      console.error('Lỗi khi đăng nhập vào NodePay:', err);
    }
  }

  async roBlox(pages) {
    const page = pages[0];

    try {
      console.log('Bắt đầu quá trình đăng ký tài khoản NodePay');

      // Chọn ngẫu nhiên tháng sinh
      await page.waitForSelector('#MonthDropdown', { timeout: 5000 });
      const monthOptions = await page.evaluate(() => {
        const select: any = document.querySelector('#MonthDropdown');
        return Array.from(select.options)
          .map((option: any) => option.value)
          .filter((value) => value && value !== '');
      });
      const randomMonth =
        monthOptions[Math.floor(Math.random() * monthOptions.length)];
      await page.select('#MonthDropdown', randomMonth);
      console.log(`✅ Đã chọn tháng: ${randomMonth}`);
      await this.sleep(Math.floor(Math.random() * 500) + 500); // Độ trễ ngẫu nhiên 500-1000ms

      // Chọn ngẫu nhiên ngày sinh
      await page.waitForSelector('#DayDropdown', { timeout: 5000 });
      const dayOptions = await page.evaluate(() => {
        const select: any = document.querySelector('#DayDropdown');
        return Array.from(select.options)
          .map((option: any) => option.value)
          .filter((value) => value && value !== '');
      });
      const randomDay =
        dayOptions[Math.floor(Math.random() * dayOptions.length)];
      await page.select('#DayDropdown', randomDay);
      console.log(`✅ Đã chọn ngày: ${randomDay}`);
      await this.sleep(Math.floor(Math.random() * 500) + 500);

      // Chọn ngẫu nhiên năm sinh
      await page.waitForSelector('#YearDropdown', { timeout: 5000 });
      const yearOptions = await page.evaluate(() => {
        const select: any = document.querySelector('#YearDropdown');
        return Array.from(select.options)
          .map((option: any) => option.value)
          .filter((value) => value && value !== '');
      });
      const randomYear =
        yearOptions[Math.floor(Math.random() * yearOptions.length)];
      await page.select('#YearDropdown', randomYear);
      console.log(`✅ Đã chọn năm: ${randomYear}`);
      await this.sleep(Math.floor(Math.random() * 500) + 500);

      // Tạo username ngẫu nhiên
      const generateRandomUsername = () => {
        const characters =
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = Math.floor(Math.random() * 9) + 4; // Độ dài từ 4 đến 12
        let username = '';
        for (let i = 0; i < length; i++) {
          username += characters.charAt(
            Math.floor(Math.random() * characters.length),
          );
        }
        return username;
      };
      const randomUsername = generateRandomUsername();
      const usernameSelector = '#signup-username';
      await this.clearAndType(page, usernameSelector, randomUsername);
      console.log(`✅ Đã nhập username: ${randomUsername}`);
      await this.sleep(Math.floor(Math.random() * 500) + 500);

      // Nhập mật khẩu cố định
      const fixedPassword = 'cOncAt3211@2@3@';
      const passwordSelector = '#signup-password';
      await this.clearAndType(page, passwordSelector, fixedPassword);
      console.log(`✅ Đã nhập mật khẩu: ${fixedPassword}`);
      await this.sleep(Math.floor(Math.random() * 500) + 500);

      // Chọn ngẫu nhiên giới tính
      await page.waitForSelector('#FemaleButton, #MaleButton', {
        timeout: 5000,
      });
      const genderOptions = ['FemaleButton', 'MaleButton'];
      const randomGenderId =
        genderOptions[Math.floor(Math.random() * genderOptions.length)];
      const randomGender = randomGenderId === 'FemaleButton' ? 'Nữ' : 'Nam';
      await page.click(`#${randomGenderId}`);
      console.log(`✅ Đã chọn giới tính: ${randomGender}`);
      await this.sleep(Math.floor(Math.random() * 500) + 500);

      // Nhấp vào nút Sign Up
      const signupButtonSelector = '#signup-button';
      await page.waitForSelector(signupButtonSelector, { timeout: 5000 });

      // Kiểm tra nút có bị vô hiệu hóa không
      const isButtonDisabled = await page.evaluate(() => {
        const button = document.querySelector('#signup-button');
        return button.hasAttribute('disabled');
      });

      if (isButtonDisabled) {
        console.warn(
          '⚠️ Nút Sign Up bị vô hiệu hóa, có thể do biểu mẫu chưa hoàn thiện',
        );
        throw new Error('Nút Sign Up bị vô hiệu hóa');
      }

      await page.click(signupButtonSelector);
      console.log('✅ Đã nhấp nút Sign Up');
      await this.sleep(1000);

      // Kiểm tra thông báo lỗi (nếu có)
      const errorMessage = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('.text-error');
        return Array.from(errorElements)
          .map((el) => el.textContent.trim())
          .filter((text) => text);
      });
      if (errorMessage.length > 0) {
        console.warn(`⚠️ Lỗi đăng ký: ${errorMessage.join(', ')}`);
        throw new Error(`Đăng ký thất bại: ${errorMessage.join(', ')}`);
      }

      console.log('Đăng ký xong, bắt đầu vòng lặp reload trang...');
      await this.startReloadLoop(page, 7200000); // Giữ nguyên logic reload từ code gốc
    } catch (err) {
      console.error('Lỗi khi đăng ký vào NodePay:', err);
    }
  }

  async getExtension(browser) {
    const page = await browser.newPage(); // Tạo một tab mới
    const extensionId = 'ilehaonighjijnmpnagapkhpcdbhclfg'; // ID của extension Grass.io
    const extensionURL = `chrome-extension://${extensionId}/index.html`; // URL của popup extension;
    await page.goto(extensionURL); // Mở giao diện popup của extension
    await this.sleep(1000);
    await page.click('button[type="button"]'); // Nhấn nút submit
    await this.sleep(1000);
    await page.type('input[type="text"]', 'username'); // Điền thông tin vào trường username
    await page.type('input[type="password"]', 'password'); // Điền thông tin vào trường password
    await page.click('button[type="submit"]'); // Nhấn nút submit
    console.log('Đã đăng nhập vào extension.');
  }

  /// Scripts using all service
  getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async getIP(proxy) {
    try {
      let agent; 
      if (proxy) {
        const proxyUrl = new URL(proxy);
        if (proxyUrl.protocol === 'socks5:') {
          // Sử dụng SocksProxyAgent cho SOCKS5
          agent = new SocksProxyAgent(proxy);
        } else if (
          proxyUrl.protocol === 'http:' ||
          proxyUrl.protocol === 'https:'
        ) {
          // Sử dụng HttpsProxyAgent cho HTTP/HTTPS
          agent = new HttpsProxyAgent(proxy);
        } else {
          throw new Error(
            `Giao thức proxy không được hỗ trợ: ${proxyUrl.protocol}`,
          );
        }

        const response = await axios.get('https://api.ipify.org?format=json', {
          httpsAgent: agent,
        });
        return response.data.ip;
      } else {
        // Không có proxy, gửi yêu cầu trực tiếp
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
      }
    } catch (error) {
      console.log('Lỗi khi lấy IP:', error.message);
      return null;
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async clearAndType(page, selector, text, chunkSize = 5, chunkDelay = 30) {
    try {
      await page.click(selector);
      // clear content
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Delete');

      // chunk length
      await this.typeWithChunks(page, selector, text, chunkSize, chunkDelay);
    } catch (err) {
      console.error(
        `Lỗi khi làm sạch và nhập dữ liệu vào trường ${selector}:`,
        err,
      );
    }
  }

  async typeWithChunks(page, selector, text, chunkSize = 5, chunkDelay = 50) {
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, i + chunkSize);
      await page.type(selector, chunk);
      await this.sleep(chunkDelay);
    }
  }

  async startReloadLoop(page, intervalMs = 7200000) {
    // Mặc định là 2 tiếng
    while (true) {
      try {
        console.log(`Chờ ${intervalMs / 1000} giây trước khi reload...`);
        await this.sleep(intervalMs);
        console.log('Reloading trang...');
        await page.reload({ waitUntil: 'networkidle2' });
      } catch (err) {
        console.error('Lỗi khi reload trang:', err);
        break;
      }
    }
  }
}


// https://www.roblox.com/CreateAccount
