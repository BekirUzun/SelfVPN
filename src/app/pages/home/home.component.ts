import { Component, OnInit } from '@angular/core';
import { config, ConfigKeys } from '../../shared/config';
import * as powershell from 'node-powershell';
import { state } from '../../shared/state';
const DigitalOcean = require('do-wrapper').default;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isDeploying = false;
  isDropletRunning = false;
  api;
  currentKey: string;
  droplet;

  constructor() {
    this.currentKey = config.get(ConfigKeys.apiKey);
    this.api = new DigitalOcean(this.currentKey);

    this.api.dropletsGetAll().then(resp => {
      console.log(resp);
      if (resp.body.droplets && resp.body.droplets.length) {
        resp.body.droplets.forEach(d => {
          console.log(d);
          if (d.name.toLowerCase().includes('vpn')) {
            this.droplet = d;
            this.isDropletRunning = true;
          }
        });
      }
      state.isHomeLoading = false;
    }).catch(err => {
      console.error(err);
      state.isHomeLoading = false;
    });
  }

  ngOnInit() {
  }

  getData() {
    return config.get(ConfigKeys.username);
  }

  getDropletIP() {
    if (this.droplet && this.droplet.networks.v4.length > 0)
      return this.droplet.networks.v4[0].ip_address;
    return '';
  }

  dropletAction() {

    let apiKey = config.get(ConfigKeys.apiKey);
    if (this.currentKey !== apiKey) {
      this.api = new DigitalOcean(apiKey);
    }

    if (this.isDropletRunning) {
      // todo: destroy droplet
    } else {
      this.isDeploying = true;

      let newDroplet = {
        name: 'DOVPN-1',
        region: 'ams3', //  ams2  ams3  fra1  lon1
        size: 's-1vcpu-1gb',
        image: 'ubuntu-18-04-x64',
        ssh_keys: [
          'd0:3e:98:df:d0:40:42:64:a7:e0:c7:b4:c8:18:07:e3'
        ],
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
      this.api.dropletsCreate(newDroplet).then(resp => {
        console.log(resp);
        this.droplet = resp.body.droplet;
        this.isDropletRunning = true;
        this.checkDroplet();
      }).catch(err => {
        console.error(err);
      });


    }

    // this.api.imagesGetAll().then(resp => {
    //   console.log(resp);
    // });

    // this.api.imagesGetById(48536776).then(resp => {
    //   console.log(resp);
    // });


  }

  checkDroplet() {
    let bootChecker = setInterval(() => {
      this.api.dropletsGetById(this.droplet.id).then(resp => {
        console.log(resp);
        let d = resp.body.droplet;
        if (d.status === 'active') {
          this.droplet = d;
          clearInterval(bootChecker);
        }
      });
    }, 10000);
  }

  connect() {
    console.log('connect clicked');

    let ps = new powershell({
      executionPolicy: 'Bypass',
      noProfile: true
    });

    // Load the gun
    ps.addCommand(
`param (
  [string]$Server = ""
)

write-output $Server`).then(() => {
      // ps.addParameters( [
      //   { server: '252.51.23.66' }
      // ]);
    });
    ps.addParameters( [
      { Server: '252.51.23.66' }
    ]);

    // Pull the Trigger
    ps.invoke().then(output => {
      console.log('output', output);
    })
    .catch(err => {
      console.error('err', err);
      ps.dispose();
    });
  }

}
