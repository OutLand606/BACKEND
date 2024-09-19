import { Controller, Post, Get, Query, Body } from '@nestjs/common';
import { AndroidService } from './android.service';

@Controller('android')
export class AndroidController {
  constructor(private readonly androidService: AndroidService) {}

  @Post('launch')
  async navigateToUrl(@Body() body): Promise<string> {
    const {  url } = body;
    return this.androidService.navigateToUrl( url);
  }
}
