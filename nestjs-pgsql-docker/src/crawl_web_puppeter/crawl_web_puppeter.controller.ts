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
  async openNewWeb(@Query() query: { url: string }) {
    const { url } = query;
    return this.service.openAllProjectAntidetectBrowser(url);
  }
}
