import { Injectable, Injector, InjectFlags } from '@angular/core';
import * as os from 'os';
import { IClient } from './interface-client';
import { WindowsClientService } from './windows-client.service';

enum platforms {
  linux = 'linux',
  mac = 'darwin',
  windows = 'win32',
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private client: IClient;

  constructor(injector: Injector) {
    if (os.platform() === platforms.windows) {
      this.client = injector.get(WindowsClientService);
    }
  }

  getClient() {
    return this.client;
  }

}
