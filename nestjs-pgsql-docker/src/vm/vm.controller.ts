import { Body, Controller, Post } from '@nestjs/common';
import { VmService } from './vm.service';

@Controller('vm')
export class VmController {
  constructor(private readonly service: VmService) {}

  @Post('list-applications')
  async listApplications(
    @Body()
    body: {
      host: string;
      username: string;
      password: string;
      osType: string;
    },
  ) {
    const { host, username, password, osType } = body;
    const applications = await this.service.getInstalledApplications(
      host,
      username,
      password,
      osType,
    );
    return { applications };
  }

  @Post('open-app')
  async openApp(
    @Body()
    body: {
      host: string;
      username: string;
      password: string;
      appOrUrl: string;
      osType: string;
    },
  ) {
    const { host, username, password, appOrUrl, osType } = body;
    await this.service.openAppOrWebsite(
      host,
      username,
      password,
      appOrUrl,
      osType,
    );
    return { message: 'Application or website opened successfully!' };
  }
}
