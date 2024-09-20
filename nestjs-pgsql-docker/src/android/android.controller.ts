import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AndroidService } from './android.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { File as MulterFile } from 'multer';

@Controller('android')
export class AndroidController {
  constructor(private readonly androidService: AndroidService) {}

  @Get('start-avd-emulator')
  async startAVD(): Promise<any> {
    return await this.androidService.startAllAvds();
  }

  @Get('close-avd-emulator')
  async closeAVD(): Promise<any> {
    return await this.androidService.closeAllAvds();
  }

  @Get('list-devices-and-app-install')
  async listDevices(): Promise<any> {
    const listDevices = await this.androidService.getActiveDevices();
    const listPackagesInstallDevice =
      await this.androidService.getInstalledApps(listDevices);
    return listPackagesInstallDevice;
  }

  @Post('install-all-apk')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      // Tối đa 10 file APK
      limits: { fileSize: 100 * 1024 * 1024 }, // Giới hạn 100 MB mỗi file
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.apk$/)) {
          return callback(new Error('Chỉ cho phép tệp APK!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async installApk(@UploadedFiles() files: MulterFile[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new Error('Không có tệp nào được tải lên.');
    }

    const results = [];
    for (const file of files) {
      console.log(`Đang cài đặt tệp: ${file.originalname}`);
      const result = await this.androidService.installApkOnAllDevices(
        file.buffer,
        file.originalname,
      );
      results.push(...result);
    }
    return results;
  }

  @Post('launch-kill-app')
  async launcherApp(@Body() body): Promise<string> {
    return this.androidService.launcherApp(body);
  }

  @Post('run-scripts')
  async runScripts(): Promise<string> {
    return this.androidService.runScripts();
  }
}
