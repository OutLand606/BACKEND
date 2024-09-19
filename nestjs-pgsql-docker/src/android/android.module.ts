import { Module } from '@nestjs/common';
import { AndroidService } from './android.service';
import { AndroidController } from './android.controller';

@Module({
  controllers: [AndroidController],
  providers: [AndroidService],
})
export class AndroidModule {}
