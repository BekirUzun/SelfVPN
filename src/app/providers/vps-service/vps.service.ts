import { Injectable } from '@angular/core';
import { config, ConfigKeys } from '../../shared/config';
import { errors } from '../../shared/errors';
import { Events } from '../events';
const DigitalOcean = require('do-wrapper').default;

@Injectable({
  providedIn: 'root'
})
export class VpsService {
  private _isDropletRunning = false;
  private api;
  private droplet;

  dropletTemplate = {
    name: 'DOVPN-1',
    region: 'ams3', //  ams2  ams3  fra1  lon1
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
- export VPN_IPSEC_PSK='8q31ADWSFfMhtW3V35JmC7OUJRMIn6Dr'
- export VPN_USER='vpnadmin'
- export VPN_PASSWORD='VpULLV8oD86L6dr9u7DjXaigQu5ShWcO'
- sh vpnsetup.sh >> userDataLog.txt
- wget http://dovpn.carlfriess.com/server && chmod +x ./server && ./server`
  };

  constructor(public events: Events) {
    let key = config.get(ConfigKeys.apiKey);
    this.api = new DigitalOcean(key);
  }

  createDroplet(): Promise<any> {
    let newDroplet = this.dropletTemplate;
    if (config.get(ConfigKeys.sshId))
      newDroplet.ssh_keys.push(config.get(ConfigKeys.sshId));

    return this.api.dropletsCreate(this.dropletTemplate).then(resp => {
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
    return '';
  }

  getDropletRegion(): string {
    if (this.droplet)
      return this.droplet.region.name;
    return '';
  }

  checkDroplets(): Promise<void> {
    return this.api.dropletsGetAll().then((resp) => {
      console.log(resp);
      if (resp.body.droplets && resp.body.droplets.length) {
        resp.body.droplets.forEach(d => {
          console.log(d);
          if (d.name.toLowerCase().includes('vpn')) {
            this.droplet = d;
            this._isDropletRunning = true;
          }
        });
      }
    });
  }

  checkDropletBooted() {
    let bootChecker = setInterval(() => {
      this.api.dropletsGetById(this.droplet.id).then(resp => {
        console.log(resp);
        let d = resp.body.droplet;
        if (d.status === 'active') {
          this.droplet = d;
          this.events.publish('droplet:booted', true);
          clearInterval(bootChecker);
        }
      });
    }, 10000);
  }


}
