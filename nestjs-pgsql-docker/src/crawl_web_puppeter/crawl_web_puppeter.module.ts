import { Module } from '@nestjs/common';
import { CrawlWebPuppeterService } from './crawl_web_puppeter.service';
import { CrawlWebPuppeterController } from './crawl_web_puppeter.controller';

@Module({
  controllers: [CrawlWebPuppeterController],
  providers: [CrawlWebPuppeterService],
})
export class CrawlWebPuppeterModule {}
