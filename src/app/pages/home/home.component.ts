import { Component, OnInit, NgZone } from '@angular/core';
import { state } from '../../shared/state';
import { VpsService } from '../../providers/vps-service/vps.service';
import { Events } from '../../shared/events';
import { LoggerService } from '../../providers/logger-service/logger.service';
import { ConfigService, ConfigKeys } from '../../providers/config-service/config.service';
import { ClientService } from '../../providers/client-service/client.service';
import { NetworkStatus } from '../../models/network';
import { IClient } from '../../providers/client-service/interface-client';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
// tslint:disable:max-line-length

  vpnConnected = false;
  isBooting = false;
  serverReady = false;
  currentKey: string;
  connectSpinner = false;
  selectedRegion = 'ams3';
  powerOn = false;
  networkChecker;
  connectAnimInterval;
  networkStatus = new NetworkStatus();
  isTopAnimating: boolean;
  isBottomAnimating: boolean;
  client: IClient;

  constructor(
    public vpsService: VpsService,
    public events: Events,
    public logs: LoggerService,
    public config: ConfigService,
    public zone: NgZone,
    clientService: ClientService) {
      this.client =  clientService.getClient();
  }

  ngOnInit() {
    this.selectedRegion = this.config.get(ConfigKeys.region);

    if (this.config.get(ConfigKeys.apiKey)) {
      this.vpsService.checkDroplets().then(() => {

        // TODO: make a request to droplet (needs server to implemented differently)
        if (this.vpsService.getDropletIP() !== 'Unknown') {
          this.serverReady = true;
        }
        if (!this.client)
          state.isHomeLoading = false;
      });
    }

    if (!this.client) {
      alert('You are using an unsupported platform. You won\'t be able to connect your VPN from this client.');
      return;
    }

    this.client.isConnected().then(isConnected => {
      if (isConnected) {
        this.vpnConnected = true;
        this.powerOn = true;
        this.startNetworkMonitor();
        this.logs.appendLog('VPN already connected');
      }
    }).catch(err => {
      this.logs.appendLog('Error while checking VPN connection: ' + JSON.stringify(err));
    }).finally(() => {
      state.isHomeLoading = false;
    });
  }

  isDropletRunning(): boolean {
    return this.vpsService.isDropletRunning();
  }

  selectChanged() {
    this.config.set(ConfigKeys.region, this.selectedRegion);
  }

  dropletAction() {
    // TODO: better confirmation UI
    let msg = this.isDropletRunning() ? 'Are you sure to destroy vpn droplet?' : 'Are you sure to create new droplet?';
    let ok = confirm(msg);
    if (!ok)
      return;

    // TODO: handle config updates
    if (this.isDropletRunning()) {
      this.vpsService.destroyDroplet().catch(err => {
        // TODO: better user message displaying
        alert('An error ocurred while destroying droplet');
        this.logs.appendLog('Error while destroying droplet: ' + JSON.stringify(err));
      }).finally(() => {
        this.isBooting = false;
        this.serverReady = false;
      });
    } else {
      this.config.set(ConfigKeys.region, this.selectedRegion);
      this.isBooting = true;
      this.vpsService.createDroplet().then().catch(err => {
        // TODO: better user message displaying
        alert('An error ocurred while creating droplet: ' + err.message);
        this.logs.appendLog('Error while creating droplet: ' + JSON.stringify(err));
      }).finally(() => {
        this.isBooting = false;
      });
      this.events.subscribe('droplet:booted', (data) => {
        console.log('droplet:booted data: ', data);
        this.logs.appendLog('Droplet booted.');
        this.isBooting = false;
      });

      this.events.subscribe('droplet:ready', (data) => {
        console.log('droplet:ready data: ', data);
        this.logs.appendLog('Droplet is ready for connections.');
        this.serverReady = true;
      });
    }
  }

  connect() {
    if (!this.isDropletRunning() || this.connectSpinner || !this.serverReady || !this.client)
      return;

    this.powerOn = !this.powerOn;
    this.connectSpinner = true;

    if (this.vpnConnected) {
      this.client.disconnect().then((output: string) => {
        this.vpnConnected = false;
        this.powerOn = false;
        this.logs.appendLog('Disconnected from VPN.');
      }).catch(err => {
        console.error('error while disconnecting, ', err);
        this.logs.appendLog('Error while disconnecting: ' + JSON.stringify(err));
      }).finally(() => {
        this.connectSpinner = false;
        this.stopNetworkMonitor();
      });
    } else {
      this.startConnectingAnimation();
      this.client.connect().then((output: string) => {
        if (output.includes('connected')) {
          this.vpnConnected = true;
          this.stopConnectingAnimation();
          this.startNetworkMonitor();
          this.logs.appendLog('Connected to vpn on ip: ' + this.vpsService.getDropletIP());
        }
      }).catch(err => {
        console.error('err', err);
        this.logs.appendLog('Error while connecting vpn: ' + JSON.stringify(err));
      }).finally(() => {
        this.connectSpinner = false;
      });
    }
  }

  startConnectingAnimation() {
    this.connectingAnimationHandler();
    this.connectAnimInterval = setInterval(() => {
      this.connectingAnimationHandler();
    }, 1500);
  }

  stopConnectingAnimation() {
    clearInterval(this.connectAnimInterval);
    this.isTopAnimating = false;
    this.isBottomAnimating = false;
  }

  connectingAnimationHandler() {
    if (this.vpnConnected)
      this.stopConnectingAnimation();

    this.isTopAnimating = true;
    setTimeout(() => {
      this.isTopAnimating = false;
    }, 1000);

    setTimeout(() => {
      this.isBottomAnimating = true;
      setTimeout(() => {
        this.isBottomAnimating = false;
      }, 1000);
    }, 750);
  }

  startNetworkMonitor() {
    this.client.startNetworkMonitor((output: string) => {
      if (!output || !output.trim() || output.includes('EOI'))
        return;
      this.zone.run(() => {
        try {
          let obj = JSON.parse(output);
          this.networkStatus.update(obj);
        } catch (err) {
          console.error('error parsing json: ', output, 'err: ', err);
        }
      });
    });
  }

  stopNetworkMonitor() {
    this.networkStatus.reset();
    this.client.stopNetworkMonitor();
  }

}
