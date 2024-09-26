import { Body, Controller, Get, Query } from '@nestjs/common';
import { PlaywrightService } from './playwright.service';
import { Public } from 'src/auth/metadata';

@Public()
@Controller('playwright')
export class PlaywrightController {
  constructor(private readonly playwrightService: PlaywrightService) {}

  @Get()
  async getFingerprint(@Body() body) {
    const { url }: { url: string } = body;
    await this.playwrightService.initBrowser();
    const fingerprint = await this.playwrightService.getFingerprint(url);
    await this.playwrightService.closeBrowser();
    return { fingerprint };
  }
}
