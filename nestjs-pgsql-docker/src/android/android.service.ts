import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class AndroidService {
  async getActiveDevices(): Promise<string[]> {
    try {
      const { stdout, stderr } = await execPromise('adb devices');
      if (stderr) {
        throw new Error(stderr);
      }
      const devices = stdout
        .split('\n')
        .filter((line) => line.includes('\tdevice'))
        .map((line) => line.split('\t')[0]);

      return devices;
    } catch (error) {
      throw new Error(`Error fetching active devices: ${error.message}`);
    }
  }

  async getInstalledApps(
    devices: string[],
  ): Promise<Array<Record<string, string>>> {
    try {
      const deviceAppsList: Array<Record<string, string>> = [];
      for (const deviceId of devices) {
        const { stdout, stderr } = await execPromise(
          `adb -s ${deviceId} shell pm list packages`,
        );
        if (stderr) {
          throw new Error(stderr);
        }
        const apps = stdout
          .split('\n')
          .filter((line) => line.includes('package:'))
          .map((line) => line.replace('package:', '').trim());

        const appAliases = apps.reduce((aliases, app) => {
          const alias = app.split('.').slice(-1)[0];
          aliases[alias] = app;
          return aliases;
        }, {});
        deviceAppsList.push({ deviceId: deviceId, ...appAliases });
      }
      return deviceAppsList;
    } catch (error) {
      throw new Error(
        `Error fetching installed apps for devices: ${error.message}`,
      );
    }
  }

  async executeCommands(
    deviceIds: string[],
    commands: string[],
  ): Promise<string> {
    for (const deviceId of deviceIds) {
      for (const command of commands) {
        const fullCommand = `adb -s ${deviceId} shell ${command}`;
        try {
          const { stdout, stderr } = await execPromise(fullCommand);
          if (stderr) {
            throw new Error(stderr);
          }
          console.log(`Output from device ${deviceId}: ${stdout}`);
        } catch (error) {}
      }
    }
    return 'Commands executed successfully on all devices';
  }

  async navigateToUrl(url: string): Promise<string> {
    const listDevices = await this.getActiveDevices();
    const listPackagesInstallDevice = await this.getInstalledApps(listDevices);
    const commands = [
      //   `am start -a android.intent.action.VIEW -d ${url}`,
      'monkey -p com.google.android.youtube -c android.intent.category.LAUNCHER 1',
      'shell input tap 600 200',
    //   'am force-stop com.google.android.youtube',
    ];

    return await this.executeCommands(listDevices, commands);
  }
}
