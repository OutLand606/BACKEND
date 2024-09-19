import { Body, Controller, Post } from '@nestjs/common';
import { RemoteDesktopService } from './remote_desktop.service';

export enum Routes {
  Controller = 'remote-desktop',
}

@Controller(Routes.Controller)
export class RemoteDesktopController {
  constructor(private readonly service: RemoteDesktopService) {}

  @Post('open')
  async openRdpSession(
    @Body()
    body: {
      host: string;
      username: string;
      password: string;
    },
  ): Promise<object> {
    const { host, username, password } = body;
    await this.service.openRdpSession({ host, username, password });
    return { message: 'Connect success' };
  }
}
