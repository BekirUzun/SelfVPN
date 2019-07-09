import { Component, OnInit, NgZone } from '@angular/core';
import * as powershell from 'node-powershell';
import { state } from '../../shared/state';
import { VpsService } from '../../providers/vps-service/vps.service';
import { Events } from '../../shared/events';
import { LoggerService } from '../../providers/logger-service/logger.service';
import { ConfigService, ConfigKeys } from '../../providers/config-service/config.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
// tslint:disable:max-line-length

  vpnConnected = false;
  isBooting = false;
  currentKey: string;
  connectSpinner = false;
  selectedRegion = 'ams3';
  powerOn = false;
  networkChecker;
  networkStatus = {
    Upload: {
      SentBytes: 0,
      TotalMB: 0,
      Speed: 0
    },
    Download: {
      TotalMB: 0,
      Speed: 0,
      ReceivedBytes: 0
    }
  };

  constructor(
    public vpsService: VpsService,
    public events: Events,
    public logs: LoggerService,
    public config: ConfigService,
    public zone: NgZone) { }

  ngOnInit() {
    this.logs.appendLog('home init');

    this.selectedRegion = this.config.get(ConfigKeys.region);

    this.vpsService.checkDroplets().then(() => {
      // TODO: make droplet and connection checking parallel
      let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
      });

      ps.addCommand(`
$vpnName = "SelfVPN";

Try
{
  $vpn = Get-VpnConnection -Name $vpnName -ErrorAction Stop;
  Write-Host $vpn.ConnectionStatus;
}
Catch
{
  Write-Host "Disconnected";
}
`);
      ps.invoke().then((output: string) => {
        if (output.includes('Connected')) {
          this.vpnConnected = true;
          this.powerOn = true;
          this.startNetworkMonitor();
          this.logs.appendLog('VPN already connected');
        }
      })
      .catch(err => {
        console.error('err', err);
        this.logs.appendLog('Error while checking VPN connection: ' + JSON.stringify(err));
      }).finally(() => {
        ps.dispose();
        state.isHomeLoading = false;
      });
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
      });
    } else {
      this.config.set(ConfigKeys.region, this.selectedRegion);
      this.isBooting = true;
      this.vpsService.createDroplet().catch(err => {
        // TODO: better user message displaying
        alert('An error ocurred while creating droplet');
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
        // TODO: handle droplet ready to connect
      });

    }
  }

  connect() {
    if (!this.isDropletRunning() || this.connectSpinner)
      return;

    this.powerOn = !this.powerOn;

    this.connectSpinner = true;
    if (this.vpnConnected) {
      let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
      });

      ps.addCommand('rasdial "SelfVPN" /disconnect ');
      ps.invoke().then((output: string) => {
        console.log(output);
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
      let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
      });

      // Load the gun
      ps.addCommand(`
$vpnName = "SelfVPN";
$vpnServer = "${this.vpsService.getDropletIP()}";
$vpnUsername = "${this.config.get(ConfigKeys.username)}"
$vpnPassword = "${this.config.get(ConfigKeys.password)}";
$vpnPsk = "${this.config.get(ConfigKeys.psk)}";

Try
{
  Remove-VpnConnection -Name $vpnName -Force -PassThru | Out-Null;
  Write-Host "Removing old vpn profile...";
}
Catch { }
Write-Host "Adding new vpn profile...";
Add-VpnConnection -Name $vpnName -ServerAddress $vpnServer -L2tpPsk $vpnPsk -TunnelType L2tp -EncryptionLevel Required -AuthenticationMethod Chap,MSChapv2 -Force -PassThru | Out-Null;

$vpn = Get-VpnConnection -Name $vpnName;

if($vpn.ConnectionStatus -eq "Disconnected"){
  Write-Host "Starting rasdial...";
  rasdial $vpnName $vpnUsername $vpnPassword;
} else {
  Write-Host "Vpn already connected.";
}
`); // DO NOT REMOVE LAST LINE BREAK!

      ps.streams.stdout.on('data', (data: string) => {
        if (!data || data.includes('EOI') || !data.trim())
          return;

        this.logs.appendLog(data);
      });

      // Pull the Trigger
      ps.invoke().then((output: string) => {
        console.log('powershell closed, output: ', output);
        if (output.includes('connected')) {
          this.vpnConnected = true;
          this.startNetworkMonitor();
          this.logs.appendLog('Connected to vpn on ip: ' + this.vpsService.getDropletIP());
        }
      })
      .catch(err => {
        console.error('err', err);
        this.logs.appendLog('Error while connecting vpn: ' + JSON.stringify(err));
      }).finally(() => {
        this.connectSpinner = false;
        ps.dispose();
      });
    }
  }

  startNetworkMonitor() {
    this.networkChecker = new powershell({
      executionPolicy: 'Bypass',
      noProfile: true
    });

    this.networkChecker.addCommand(`
$totalDown = 0.0;
$totalUp = 0.0;
$lastRecv = 0;
$lastSent = 0;
$statsInit = Get-NetAdapterStatistics;
$statsInit | ForEach-Object {
    $lastRecv = $lastRecv + $_.ReceivedBytes;
    $lastSent = $lastSent + $_.SentBytes;
}

while($true)
{
    Start-Sleep -s 1
    $currRecv = 0;
    $currSent = 0;
    $stats = Get-NetAdapterStatistics;
    $stats | ForEach-Object {
        $currRecv += $_.ReceivedBytes;
        $currSent += $_.SentBytes;
    }

    $recvBytes = $currRecv - $lastRecv;
    $sentBytes = $currSent - $lastSent;

    $totalDown += $recvBytes * 0.00000085;
    $totalUp += $sentBytes * 0.00000085;

    $downSpeed = $recvBytes * 0.00085;
    $uploadSpeed = $sentBytes * 0.00085;
    $lastRecv = $currRecv;
    $lastSent = $currSent;

    $result = @{
        Download = @{
            Speed = $downSpeed
            ReceivedBytes = $recvBytes
            TotalMB = $totalDown
        }
        Upload = @{
            Speed = $uploadSpeed
            SentBytes = $sentBytes
            TotalMB = $totalUp
        }
    }
    $json = ConvertTo-Json $result;
    Write-Host $json;
}
`); // DO NOT REMOVE LAST LINE BREAK!

      this.networkChecker.streams.stdout.on('data', (data: string) => {
        if (!data || data.includes('EOI') || !data.trim())
          return;
        this.zone.run(() => {
          console.log(data);
          this.networkStatus = JSON.parse(data);
        });
        // this.logs.appendLog(data);
      });
      this.networkChecker.invoke().catch(err => {
        console.error('err', err);
        // this.logs.appendLog('Error while checking network usage: ' + JSON.stringify(err));
      });
  }

  getDownloadSpeed(): string {
    return this.getFormattedUnit(this.networkStatus.Download.Speed, 'KB/s');
  }
  getUploadSpeed(): string {
    return this.getFormattedUnit(this.networkStatus.Upload.Speed, 'KB/s');
  }
  getTotalDownload(): string {
    return this.getFormattedUnit(this.networkStatus.Download.TotalMB, 'MB');
  }
  getTotalUpload(): string {
    return this.getFormattedUnit(this.networkStatus.Upload.TotalMB, 'MB');
  }

  getFormattedUnit(rawSpeed, rawUnit = 'KB'): string {
    let upperUnit;
    if (rawUnit.includes('s'))
      upperUnit = (rawUnit === 'KB/s') ? 'MB/s' : 'GB/s';
    else
      upperUnit = (rawUnit === 'KB') ? 'MB' : 'GB';

    if (rawSpeed > 1000)
      return (rawSpeed / 1000).toFixed(0) + ' ' + upperUnit;
    else
      return rawSpeed.toFixed(0) + ' ' + rawUnit;
  }

  stopNetworkMonitor() {
    this.networkStatus.Download.Speed = 0;
    this.networkStatus.Download.TotalMB = 0;
    this.networkStatus.Upload.Speed = 0;
    this.networkStatus.Upload.TotalMB = 0;

    const process = require('process');
    process.kill(this.networkChecker.pid);
    this.networkChecker = undefined;
  }

}
