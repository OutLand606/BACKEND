import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserActivityLogsService } from './user_activity_logs.service';

@Controller('user-activity-logs')
export class UserActivityLogsController {
  constructor(private readonly service: UserActivityLogsService) {}

  @Post('/:id')
  async create(@Param() pra, @Body() body) {
    const { id }: { id: number } = pra;
    return await this.service.getDataRawQuery(id, body);
  }
}
