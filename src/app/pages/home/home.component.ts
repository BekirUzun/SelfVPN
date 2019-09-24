import { Component, OnInit, NgZone } from '@angular/core';
import { state } from '../../shared/state';
import { VpsService } from '../../providers/vps-service/vps.service';
import { Events } from '../../shared/events';
import { LoggerService } from '../../providers/logger-service/logger.service';
import { ConfigService, ConfigKeys } from '../../providers/config-service/config.service';
import { ClientService } from '../../providers/client-service/client.service';
import { NetworkStatus } from '../../models/network';
import { IClient } from '../../providers/client-service/interface-client';
import { StatusMessages } from '../../shared/enums';
import { NbDialogService } from '@nebular/theme';
import { DialogComponent } from '../../components/dialog/dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
// tslint:disable:max-line-length

  vpnConnected = false;
  isMonitoringStarted = false;
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
  status: string;
  dialogRef;

  constructor(
    public vpsService: VpsService,
    public events: Events,
    public logs: LoggerService,
    public config: ConfigService,
    public zone: NgZone,
    private dialogService: NbDialogService,
    clientService: ClientService,
    ) {
      this.client =  clientService.getClient();
  }

  ngOnInit() {
    this.selectedRegion = this.config.get(ConfigKeys.region);

    if (this.config.get(ConfigKeys.apiKey)) {
      this.checkDroplet();
    } else {
      this.status = StatusMessages.needApiKey;
      this.events.subscribe('config:apikey_update', () => {
        this.checkDroplet();
      });
    }

    if (!this.client) {
      this.showAlert('You are using an unsupported platform. You won\'t be able to connect VPN');
      state.isHomeLoading = false;
      return;
    }

    this.client.isConnected().then(isConnected => {
      if (isConnected) {
        this.vpnConnected = true;
        this.powerOn = true;
        this.startNetworkMonitor();
        this.logs.appendLog('VPN already connected');
        this.status = StatusMessages.connected;
      }
    }).catch(err => {
      this.logs.appendLog('Error while checking VPN connection: ' + JSON.stringify(err));
    }).finally(() => {
      state.isHomeLoading = false;
    });
  }

  showAlert(message) {
    this.dialogRef = this.dialogService.open(DialogComponent, {
      context: {
        message: message,
        confirm: () => { this.dialogRef.close(); },
        // cancel: () => { this.dialogRef.close(); }
      },
    });
  }

  showConfirm(message, onConfirm) {
    this.dialogRef = this.dialogService.open(DialogComponent, {
      context: {
        message: message,
        confirm: onConfirm,
        cancel: () => { this.dialogRef.close(); }
      },
    });
  }

  checkDroplet() {
    this.status = StatusMessages.loading;
    this.vpsService.checkDroplets().then(() => {

      // TODO: make a request to droplet (needs server to implemented differently)
      if (this.vpsService.getDropletIP() !== 'Unknown') {
        this.serverReady = true;
        this.status = StatusMessages.readyToConnect;
      } else {
        this.status = StatusMessages.noDroplet;
      }
      if (!this.client)
        state.isHomeLoading = false;
    });
  }

  isDropletRunning(): boolean {
    return this.vpsService.isDropletRunning();
  }

  selectChanged() {
    this.config.set(ConfigKeys.region, this.selectedRegion);
  }

  dropletClickHandler() {
    let msg = this.isDropletRunning() ? 'Are you sure to destroy vpn droplet?' : 'Are you sure to create new droplet?';
    this.showConfirm(msg, () => {
      this.dropletAction();
      this.dialogRef.close();
    });
  }

  dropletAction() {
    // TODO: handle config updates
    if (this.isDropletRunning()) {
      this.status = StatusMessages.destroying;
      this.vpsService.destroyDroplet().catch(err => {
        // TODO: better user message displaying
        this.showAlert('An error ocurred while destroying droplet');
        this.logs.appendLog('Error while destroying droplet: ' + JSON.stringify(err));
      }).finally(() => {
        this.isBooting = false;
        this.serverReady = false;
        this.status = StatusMessages.noDroplet;
      });
    } else {
      this.config.set(ConfigKeys.region, this.selectedRegion);
      this.isBooting = true;
      this.status = StatusMessages.creating;
      this.vpsService.createDroplet().then(() => {
        this.status = StatusMessages.booting;
      }).catch(err => {
        // TODO: better user message displaying
        this.showAlert('An error ocurred while creating droplet: ' + err.message);
        this.logs.appendLog('Error while creating droplet: ' + JSON.stringify(err));
      }).finally(() => {
        this.isBooting = false;
      });

      this.events.subscribe('droplet:booted', (data) => {
        console.log('droplet:booted data: ', data);
        this.logs.appendLog('Droplet booted.');
        this.isBooting = false;
        this.status = StatusMessages.vpnInstalling;
      });

      this.events.subscribe('droplet:ready', (data) => {
        console.log('droplet:ready data: ', data);
        this.logs.appendLog('Droplet is ready for connections.');
        this.serverReady = true;
        this.status = StatusMessages.readyToConnect;
      });
    }
  }

  connect() {
    if (!this.isDropletRunning() || this.connectSpinner || !this.serverReady || !this.client)
      return;

    this.powerOn = !this.powerOn;
    this.connectSpinner = true;

    if (this.vpnConnected) {
      this.status = StatusMessages.disconnecting;
      this.client.disconnect().then((output: string) => {
        this.vpnConnected = false;
        this.powerOn = false;
        this.logs.appendLog('Disconnected from VPN.');
        this.status = StatusMessages.readyToConnect;
      }).catch(err => {
        console.error('error while disconnecting, ', err);
        this.logs.appendLog('Error while disconnecting: ' + JSON.stringify(err));
      }).finally(() => {
        this.connectSpinner = false;
        this.stopNetworkMonitor();
      });
    } else {
      this.startConnectingAnimation();
      this.status = StatusMessages.connecting;
      this.client.connect().then((output: string) => {
        if (output.includes('connected')) {
          this.vpnConnected = true;
          this.status = StatusMessages.connected;
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
    this.isMonitoringStarted = true;
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
    this.isMonitoringStarted = false;
    this.networkStatus.reset();
    this.client.stopNetworkMonitor();
  }

}
