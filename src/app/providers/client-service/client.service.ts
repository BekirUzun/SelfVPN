import { Injectable } from '@angular/core';
import * as powershell from 'node-powershell';
import { VpsService } from '../../providers/vps-service/vps.service';
import { ConfigService, ConfigKeys } from '../../providers/config-service/config.service';
import { LoggerService } from '../logger-service/logger.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
// tslint:disable:max-line-length

  networkChecker: powershell;

  constructor(public vpsService: VpsService, public config: ConfigService, public logs: LoggerService) { }

  connect(): Promise<any> {
    this.logs.appendLog('Connecting to VPN...');
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

    // Pull the Trigger
    return ps.invoke().then((output: string) => {
      ps.dispose();
      return output;
    });
  }

  disconnect(): Promise<any> {
    this.logs.appendLog('Disconnecting from VPN...');
    let ps = new powershell({
      executionPolicy: 'Bypass',
      noProfile: true
    });

    ps.addCommand('rasdial "SelfVPN" /disconnect ');
    return ps.invoke().finally(() => {
      ps.dispose();
    });
  }

  isConnected(): Promise<boolean> {
    this.logs.appendLog('Checking VPN connection...');
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
    return ps.invoke().then((output: string) => {
      ps.dispose();
      return output.includes('Connected');
    });
  }

  startNetworkMonitor(outputHandler: (output: string) => void): Promise<any> {
    this.logs.appendLog('Starting network monitoring...');
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

    this.networkChecker.streams.stdout.on('data', outputHandler);
    return this.networkChecker.invoke();
  }

  stopNetworkMonitor() {
    return new Promise((resolve, reject) => {
      if (!this.networkChecker) {
        resolve();
        return;
      }

      try {
        const process = require('process');
        process.kill(this.networkChecker.pid);
        this.networkChecker = undefined;
        resolve();
      } catch (err) {
        // ESRCH: pid not found, process does not exists
        if (err.code === 'ESRCH' || err.errno === 'ESRCH')
          resolve();
        else
          reject(err);
      }
    });
  }
}
