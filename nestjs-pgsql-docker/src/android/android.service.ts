import { Injectable } from '@nestjs/common';
import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class AndroidService {
  async startAllAvds(): Promise<string[]> {
    try {
      const { stdout: listOutput } = await execPromise('emulator -list-avds');
      const avdList = listOutput.split('\n').filter((avd) => avd.trim() !== '');
      if (avdList.length === 0) {
        throw new Error('Không tìm thấy máy ảo nào.');
      }
      const startPromises = avdList.map(async (avdName) => {
        return new Promise<string>((resolve, reject) => {
          const process = spawn('emulator', ['-avd', avdName], {
            detached: true,
            stdio: 'ignore',
          });
          process.on('error', (error) => {
            reject(`Lỗi khi khởi động AVD ${avdName}: ${error.message}`);
          });
          process.unref();
          resolve(`Máy ảo ${avdName} đang được khởi động độc lập.`);
        });
      });

      const results = await Promise.all(startPromises);
      return results;
    } catch (error) {
      throw new Error(
        `Lỗi khi lấy danh sách AVD hoặc khởi động AVD: ${error.message}`,
      );
    }
  }

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

  async installApkOnAllDevices(
    buffer: Buffer,
    originalname: string,
  ): Promise<string[]> {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const tempFilePath = path.join(uploadDir, originalname);
    fs.writeFileSync(tempFilePath, buffer);
    try {
      const devices = await this.getActiveDevices();
      const results = [];
      for (const device of devices) {
        try {
          const { stderr } = await execPromise(
            `adb -s ${device} install -r ${tempFilePath}`,
          );
          if (stderr) {
            results.push(`Lỗi khi cài đặt ${originalname} trên ${device}: ${stderr}`);
          } else {
            results.push(
              `Cài đặt APK ${originalname} thành công trên ${device}`,
            );
          }
        } catch (installError) {
          results.push(
            `Lỗi cài đặt trên thiết bị ${device}: ${installError.message}`,
          );
          continue;
        }
      }
      return results;
    } catch (error) {
      throw new Error(`Lỗi khi cài đặt APK ${originalname}: ${error.message}`);
    } finally {
      fs.unlinkSync(tempFilePath);
    }
  }

  async executeCommands(
    deviceIds: string[],
    commands: string[],
  ): Promise<string> {
    if (deviceIds.length > 0) {
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
    } else {
      return 'There are no devices running on the computer';
    }
  }

  async navigateToUrl(body): Promise<string> {
    const listDevices = await this.getActiveDevices();
    const commands = [
      //   `am start -a android.intent.action.VIEW -d ${body.url}`,
      // 'monkey -p com.google.android.youtube -c android.intent.category.LAUNCHER 1',
      // 'am force-stop com.google.android.youtube',
      'monkey -p org.telegram.messenger.web -c android.intent.category.LAUNCHER 1',
    ];

    return await this.executeCommands(listDevices, commands);
  }
}
