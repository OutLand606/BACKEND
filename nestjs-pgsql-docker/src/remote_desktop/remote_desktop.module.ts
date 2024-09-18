import { Module } from '@nestjs/common';
import { RemoteDesktopService } from './remote_desktop.service';
import { RemoteDesktopController } from './remote_desktop.controller';

@Module({
  controllers: [RemoteDesktopController],
  providers: [RemoteDesktopService],
})
export class RemoteDesktopModule {}
