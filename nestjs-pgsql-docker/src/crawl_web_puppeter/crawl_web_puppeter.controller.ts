import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { CrawlWebPuppeterService } from './crawl_web_puppeter.service';


@Controller('crawl-web-puppeter')
export class CrawlWebPuppeterController {
  constructor(private readonly service: CrawlWebPuppeterService) {}

  @Post('data-web')
  async crawlDtaWeb(@Body() body: any) {
    const { url, parse_description }: { url: string, parse_description:string } = body;
    return this.service.crawlDtaWebFingerPrint(url,parse_description);
  }
}
