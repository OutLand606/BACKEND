import { Injectable } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();
@Injectable()
export class VmService {
  async getInstalledApplications(
    host: string,
    username: string,
    password: string,
    osType: string,
  ): Promise<string[]> {
    try {
      await ssh.connect({ host, username, password });

      let command = '';
      if (osType === 'linux') {
        command = 'ls /usr/share/applications'; // Liệt kê các ứng dụng trên Linux
      } else if (osType === 'windows') {
        command = 'wmic product get name'; // Liệt kê các ứng dụng trên Windows
      } else if (osType === 'macos') {
        command = 'ls /Applications'; // Liệt kê các ứng dụng trên macOS
      }

      const result = await ssh.execCommand(command);
      ssh.dispose();

      return result.stdout.split('\n').filter((app) => app.trim() !== ''); // Trả về danh sách ứng dụng
    } catch (error) {
      console.error('Error listing applications:', error);
      throw new Error('Unable to list applications');
    }
  }

  async openAppOrWebsite(
    host: string,
    username: string,
    password: string,
    appOrUrl: string,
    osType: string,
  ) {
    try {
      await ssh.connect({ host, username, password });

      let command = '';
      if (osType === 'linux') {
        command = `xdg-open ${appOrUrl}`; // Mở ứng dụng hoặc trang web trên Linux
      } else if (osType === 'windows') {
        command = `start ${appOrUrl}`; // Mở ứng dụng hoặc trang web trên Windows
      } else if (osType === 'macos') {
        command = `open ${appOrUrl}`; // Mở ứng dụng hoặc trang web trên macOS
      }

      await ssh.execCommand(command);
      ssh.dispose();
    } catch (error) {
      console.error('Error opening application or website:', error);
    }
  }
}
