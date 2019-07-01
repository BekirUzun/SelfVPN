import { Component, OnInit } from '@angular/core';
import { config, ConfigKeys } from '../../shared/config';
import * as powershell from 'node-powershell';
import { state } from '../../shared/state';
import { VpsService } from '../../providers/vps-service/vps.service';
import { Events } from '../../providers/events';
const DigitalOcean = require('do-wrapper').default;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isBooting = false;
  currentKey: string;

  constructor(public vpsService: VpsService, public events: Events) {
    // this.currentKey = config.get(ConfigKeys.apiKey);
    // this.api = new DigitalOcean(this.currentKey);
  }

  ngOnInit() {
    this.vpsService.checkDroplets().finally(() => {
      state.isHomeLoading = false;
    });
  }

  isDropletRunning(): boolean {
    return this.vpsService.isDropletRunning();
  }

  getDropletIP(): string {
    return this.vpsService.getDropletIP();
  }

  getDropletRegion(): string {
    return this.vpsService.getDropletRegion();
  }

  dropletAction() {

    // TODO: handle config updates

    if (this.isDropletRunning()) {
      this.vpsService.destroyDroplet().then(() => {
        this.isBooting = false;
      }).catch(() => {
        // TODO: better user message displaying
        alert('an error ocurred while destroying droplet');
      });
    } else {
      this.isBooting = true;
      this.vpsService.createDroplet();
      this.events.subscribe('droplet:booted', (data) => {
        console.log('droplet:booted data: ', data);
        this.isBooting = false;
      });

      this.events.subscribe('droplet:ready', (data) => {
        console.log(data);
        // TODO: handle droplet ready to connect
      });

    }
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
