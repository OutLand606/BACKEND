import { Controller, Post, Body, UseGuards, Query } from '@nestjs/common';
import { CrawlWebPuppeterService } from './crawl_web_puppeter.service';
import { crawlWebDTO } from './dto/crawl_web.dto';
import { Public } from 'src/auth/metadata';

@Controller('crawl-web-puppeter')
export class CrawlWebPuppeterController {
  constructor(private readonly service: CrawlWebPuppeterService) {}

  @Public()
  @Post('data-web')
  async crawlDtaWeb(@Body() body: crawlWebDTO) {
    const {
      url,
      parse_description,
    }: { url: string; parse_description: string } = body;
    return this.service.crawlDtaWebFingerPrint(url, parse_description);
  }

  @Public()
  @Post('open-web-page')
  async openNewWeb(@Query() query: { url: string; quantity?: string }) {
    const { url, quantity } = query;
    const config: any = await this.service.getConfig();
    const listProfileKeys = config.profiles.length;
    const finalQuantity =
      quantity && !isNaN(+quantity) ? +quantity : listProfileKeys;
    return this.service.openProFileAntidetectBrowser(url, finalQuantity);
  }

  @Public()
  @Post('close-web-page')
  async closeWebPage(@Query() query: { profileNames: string }) {
    const { profileNames } = query;
    const profilesToClose = profileNames ? profileNames.split(',') : [];
    await this.service.closeProfile(profilesToClose);
    return { message: 'Đã đóng các profile thành công!' };
  }

  @Public()
  @Post('create-profile-chrome')
  async createProfileChrome(@Query() query: { profileNames: string }) {
    const { profileNames } = query;
    return this.service.copyChromeProfile(profileNames);
  }
}
