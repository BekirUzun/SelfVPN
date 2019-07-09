import { Injectable } from '@angular/core';
import { errors } from '../../shared/errors';
import { Events } from '../../shared/events';
import { net } from 'electron';
import { LoggerService } from '../logger-service/logger.service';
import { ConfigService, ConfigKeys } from '../config-service/config.service';
const http = require('http');
const DigitalOcean = require('do-wrapper').default;

@Injectable({
  providedIn: 'root'
})
export class VpsService {
  private _isDropletRunning = false;
  private api;
  private droplet;

  constructor(public events: Events, public logs: LoggerService, public config: ConfigService) {
    let key = this.config.get(ConfigKeys.apiKey);
    this.api = new DigitalOcean(key);
  }

  createDroplet(): Promise<any> {
    let newDroplet = {
      name: 'SelfVPN',
      region: this.config.get(ConfigKeys.region),
      size: 's-1vcpu-1gb',
      image: 'ubuntu-18-04-x64',
      ssh_keys: [],
      backups: false,
      monitoring: false,
      ipv6: false,
      user_data: `#cloud-config

runcmd:
 - echo 'Started server. Updating... ' > userDataLog.txt
 - export DEBIAN_FRONTEND=noninteractive
 - apt-get update >> userDataLog.txt
 - apt-get -qq upgrade >> userDataLog.txt
 - wget https://git.io/vpnsetup -O vpnsetup.sh && sudo >> userDataLog.txt
 - export VPN_IPSEC_PSK='${this.config.get(ConfigKeys.psk)}'
 - export VPN_USER='${this.config.get(ConfigKeys.username)}'
 - export VPN_PASSWORD='${this.config.get(ConfigKeys.password)}'
 - sh vpnsetup.sh >> userDataLog.txt
 - wget http://dovpn.carlfriess.com/server && chmod +x ./server && ./server`
    };

    if (this.config.get(ConfigKeys.sshId))
      newDroplet.ssh_keys.push(this.config.get(ConfigKeys.sshId));

    return this.api.dropletsCreate(newDroplet).then(resp => {
      this.droplet = resp.body.droplet;
      this._isDropletRunning = true;
      this.checkDropletBooted();
    });
  }

  destroyDroplet(): Promise<void> {
    return new Promise<any>(async(resolve, reject) => {
      if (!this.droplet && !this.droplet.id && this.droplet.id < 1)
        reject();

      try {
        await this.api.dropletsDelete(this.droplet.id);
        this._isDropletRunning = false;
        this.droplet = undefined;
        return resolve();
      } catch (e) {
        console.error('error while destroying droplet, ', e);
        reject();
      }
    });
  }

  updateApiKey(key: string): Promise<void> {
    let apiToCheck = new DigitalOcean(key);
    return apiToCheck.account().then((resp) => {
      if (resp.body.account.droplet_limit === 0) {
        throw new Error(errors.DROPLET_LIMIT);
      }
      this.api = apiToCheck;
    });
  }

  isDropletRunning(): boolean {
    return this._isDropletRunning;
  }

  getDropletIP(): string {
    if (this.droplet && this.droplet.networks.v4.length > 0)
      return this.droplet.networks.v4[0].ip_address;
    return 'Unknown';
  }

  getDropletRegion(): string {
    if (this.droplet)
      return this.droplet.region.name;
    return 'Unknown';
  }

  checkDroplets(): Promise<void> {
    return this.api.dropletsGetAll().then((resp) => {
      if (resp.body.droplets && resp.body.droplets.length) {
        resp.body.droplets.forEach(d => {
          console.log(d);
          if (d.name.toLowerCase().includes('vpn')) {
            this.droplet = d;
            this._isDropletRunning = true;
          }
        });
      }
    }).catch(err => {
      console.log('error while checking droplets: ', err);
      this.logs.appendLog('Error while checking droplets: ' + JSON.stringify(err));
      return err;
    });
  }

  checkDropletBooted() {
    let bootChecker = setInterval(() => {
      this.api.dropletsGetById(this.droplet.id).then(resp => {
        console.log(resp);
        let d = resp.body.droplet;
        if (d.status === 'active' || d.networks.v4.length > 0) {
          this.droplet = d;
          this.events.publish('droplet:booted', true);
          this.checkDropletReady();
          clearInterval(bootChecker);
        }
      });
    }, 10000);
  }

  checkDropletReady() {
    let readyChecker = setInterval(() => {

      http.get('http://' + this.getDropletIP() + '/', (res) => {
        console.log('res', res);
        if (res.statusCode === 200) {
          this.events.publish('droplet:ready', true);
          clearInterval(readyChecker);
        }
      }).on('error', (e) => {
        console.log('error', e);
      });

      clearInterval(readyChecker);

    }, 10000);
  }


}
