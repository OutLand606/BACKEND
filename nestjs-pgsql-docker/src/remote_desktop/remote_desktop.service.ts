import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class RemoteDesktopService {
  async openRdpSession(host, username, password): Promise<void> {
    try {
      // Command to open RDP session
      const command = `mstsc /v:${host} /u:${username} /p:${password}`;

      // Execute command
      await execPromise(command);

      console.log('RDP session opened successfully');
    } catch (error) {
      console.error('Error opening RDP session:', error);
    }
  }
}
