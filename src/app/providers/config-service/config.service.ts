import { Injectable } from '@angular/core';
import * as electron from 'electron';
import * as randomString from 'crypto-random-string';
import * as Store from 'electron-store';

export enum ConfigKeys {
  apiKey = 'apiKey',
  username = 'username',
  password = 'password',
  psk = 'psk',
  sshId = 'sshId',
  windowPosition = 'windowPosition',
  region = 'region'
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  store: Store<any>;
  readonly encKey = 'mOBXifZiEMeYKyUSTMRXJMv4f4kK07HV';

  constructor() {
    this.store = new Store({encryptionKey: this.encKey, fileExtension: 'vpn'});
  }

  public get(key: ConfigKeys) {
    if (!this.store.has(key)) {
      this.store.set(key, this.generateData(key));
    }
    return this.store.get(key);
  }

  public set(key: ConfigKeys, val: any) {
    this.store.set(key, val);
  }

  public regenerateKeys() {
    this.store.set(ConfigKeys.username, this.generateData(ConfigKeys.username));
    this.store.set(ConfigKeys.password, this.generateData(ConfigKeys.password));
    this.store.set(ConfigKeys.psk, this.generateData(ConfigKeys.psk));
  }

  private generateData(key: ConfigKeys) {
    switch (key) {
      case ConfigKeys.username: {
        return this.generateString(12);
      }
      case ConfigKeys.password: {
        return this.generateString(24);
      }
      case ConfigKeys.psk: {
        return this.generateString(24);
      }
      case ConfigKeys.windowPosition: {
        const size = electron.screen.getPrimaryDisplay().workAreaSize;
        return { x: size.width / 2 - 200, y: size.height / 2 - 250 };
      }
      case ConfigKeys.region: {
        return 'ams3';
      }
      default: {
        return '';
      }
    }
  }

  private generateString(len: number) {
    return randomString({
      length: len,
      characters: 'ABCDEFGHIJKLMNOPRSTUVYZXWabcdefghijklmoprstuvyz0123456789'
    });
  }
}
