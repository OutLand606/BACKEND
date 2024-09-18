import { Controller, Post, Body, UseGuards, Query } from '@nestjs/common';
import { CrawlWebPuppeterService } from './crawl_web_puppeter.service';
import { crawlWebDTO } from './dto/crawl_web.dto';
import { Public } from 'src/auth/metadata';

@Controller('crawl-web-puppeter')
export class CrawlWebPuppeterController {
  constructor(private readonly service: CrawlWebPuppeterService) {}

  // @Public()
  @Post('data-web')
  async crawlDtaWeb(@Body() body: crawlWebDTO) {
    const {
      url,
      parse_description,
    }: { url: string; parse_description: string } = body;
    return this.service.crawlDtaWebFingerPrint(url, parse_description);
  }

  @Public()
  @Post('new-web')
  async openNewWeb(
    @Query() query: { url: string; browser: string; os: string },
  ) {
    const { browser, url, os } =
      query;
    const { spawn } = require('child_process');

    try {
      let process;

      if (os === 'windows') {
        switch (browser.toLowerCase()) {
          case 'chrome':
            process = spawn('chrome', [url], { shell: true });
            break;
          case 'firefox':
            process = spawn('firefox', [url], { shell: true });
            break;
          case 'edge':
            process = spawn('msedge', [url], { shell: true });
            break;
          default:
            console.error('Unsupported browser');
            return;
        }
      } else if (os === 'mac') {
        process = spawn('open', ['-na', browser, url]);
      } else if (os === 'linux') {
        process = spawn(browser, [url], { shell: true });
      } else {
        console.error('Unsupported OS');
        return;
      }

      process.stdout.on('data', (data) => {
        console.log(`Output from ${browser}: ${data}`);
      });

      process.stderr.on('data', (data) => {
        console.error(`Error from ${browser}: ${data}`);
      });

      process.on('close', (code) => {
        console.log(`Process ${browser} exited with code ${code}`);
      });
    } catch (error) {
      console.error('An error occurred while opening the browser:', error);
    }
  }
}
