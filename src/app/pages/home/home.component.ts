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
// tslint:disable:max-line-length

  vpnConnected = false;
  isBooting = false;
  currentKey: string;

  constructor(public vpsService: VpsService, public events: Events) { }

  ngOnInit() {
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
        }
      })
      .catch(err => {
        console.error('err', err);
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

  dropletAction() {

    // TODO: better confirmation UI
    let msg = this.isDropletRunning() ? 'Are you sure to destroy vpn droplet?' : 'Are you sure to create new droplet?';
    let ok = confirm(msg);
    if (!ok)
      return;

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

    if (this.vpnConnected) {

    } else {
      let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
      });

      // Load the gun
      ps.addCommand(`
$vpnName = "SelfVPN";
$vpnServer = "${this.vpsService.getDropletIP()}";
$vpnUsername = "vpnadmin"
$vpnPassword = "VpULLV8oD86L6dr9u7DjXaigQu5ShWcO";
$vpnPsk = "8q31ADWSFfMhtW3V35JmC7OUJRMIn6Dr";

Try
{
  $vpnTest = Get-VpnConnection -Name $vpnName -ErrorAction Stop;
  Write-Host "- vpn found";
}
Catch
{
  Write-Host "- no vpn found, adding...";
  Add-VpnConnection -Name $vpnName -ServerAddress $vpnServer -L2tpPsk $vpnPsk -TunnelType L2tp -EncryptionLevel Required -AuthenticationMethod Chap,MSChapv2 -Force -RememberCredential -PassThru | Out-Null;
}

$vpn = Get-VpnConnection -Name $vpnName;
if($vpn.ServerAddress -ne $vpnServer){
  Write-Host "- changing vpn server adress...";
  Set-VpnConnection -Name $vpnName -ServerAddress $vpnServer -PassThru | Out-Null;
} else {
  Write-Host "- server adress is correct";
}

if($vpn.ConnectionStatus -eq "Disconnected"){
  Write-Host "- starting rasdial...";
  rasdial $vpnName $vpnUsername $vpnPassword;
} else {
  Write-Host "- vpn already connected. exiting...";
}
`); // DO NOT REMOVE LAST LINE BREAK!

      ps.streams.stdout.on('data', (data: string) => {
        if (!data || data.includes('EOI') || !data.trim())
          return;

        console.log(data);
      });

      // Pull the Trigger
      ps.invoke().then((output: string) => {
        console.log('powershell closed, output: ', output);
        if (output.includes('connected')) {
          this.vpnConnected = true;
        }
      })
      .catch(err => {
        console.error('err', err);
      }).finally(() => {
        ps.dispose();
      });
    }
  }

}
