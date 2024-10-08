import { Body, Controller, Get, Query } from '@nestjs/common';
import { PlaywrightService } from './playwright.service';
import { Public } from 'src/auth/metadata';

@Public()
@Controller('playwright')
export class PlaywrightController {
  constructor(private readonly playwrightService: PlaywrightService) {}

  @Get('open')
  async openBrowser(@Query('url') url: string): Promise<string> {
    const page = await this.playwrightService.launchBrowser();
    await this.playwrightService.navigate(url);
    return 'Browser opened and navigated to ' + url;
  }

  @Get('close')
  async closeBrowser(): Promise<string> {
    await this.playwrightService.closeBrowser();
    return 'Browser closed';
  }
}
