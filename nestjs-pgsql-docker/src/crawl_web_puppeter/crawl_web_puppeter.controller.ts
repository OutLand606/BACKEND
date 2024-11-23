import {
  Controller,
  Post,
  Body,
  UseGuards,
  Query,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CrawlWebPuppeterService } from './crawl_web_puppeter.service';
import { Public } from 'src/auth/metadata';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('crawl-web-puppeter')
export class CrawlWebPuppeterController {
  constructor(private readonly service: CrawlWebPuppeterService) {}

  @Public()
  @Post('data-web')
  async crawlDtaWeb(@Body() body: { url: string; parse_description: string }) {
    const {
      url,
      parse_description,
    }: { url: string; parse_description: string } = body;
    return this.service.crawlDtaWebFingerPrint(url, parse_description);
  }

  @Public()
  @Post('open-web-page')
  async openNewWeb(@Body() body: { url: string; quantity?: string }) {
    const { url, quantity } = body;
    return this.service.openProFileAntidetectBrowser(url, +quantity);
  }

  @Public()
  @Post('close-web-page')
  async closeWebPage(@Query() query: { profileNames: string }) {
    const { profileNames } = query;
    const profilesToClose = profileNames ? profileNames.split(',') : [];
    await this.service.closeProfile(profilesToClose);
    return { message: 'Close Pages Success!' };
  }

  @Public()
  @Post('create-profile-chrome')
  async createProfileChrome(@Query() query: { profileNames: string }) {
    const { profileNames } = query;
    return this.service.copyChromeProfile(profileNames);
  }

  @Public()
  @Post('run-scripts-profile-chrome')
  async runScript(@Query() query: { profileNames: string; scriptsName: any }) {
    const { profileNames, scriptsName } = query;
    const profileNamesRunScript = profileNames ? profileNames.split(',') : [];
    await this.service.runScriptOnProfile(profileNamesRunScript, scriptsName);
    return { message: 'Run Script in Pages Success!' };
  }

  @Public()
  @Post('import-file-txt')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10 MB mỗi file
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.txt$/)) {
          return callback(new BadRequestException('Only File TXT!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async importFileTxT(@UploadedFile() file, @Query() query) {
    const { options } = query;

    try {
      const jsonPath = await this.service.importFileTxt(file, options);
      return {
        message: 'The TxT file is converted and saved!',
        filePath: jsonPath,
      };
    } catch (error) {
      throw error;
    }
  }
}
