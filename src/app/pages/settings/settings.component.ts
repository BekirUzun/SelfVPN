import { Component, OnInit } from '@angular/core';
import { config, ConfigKeys } from '../../shared/config';
import { state } from '../../shared/state';
import { VpsService } from '../../providers/vps-service/vps.service';
import { errors } from '../../shared/errors';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  apiKey: string;
  username: string;
  password: string;
  psk: string;
  sshId: string;
  connected = false;

  constructor(public vpsService: VpsService) { }

  ngOnInit() {
   this.loadConfig();
  }

  save() {
    state.isHomeLoading = true;

    config.set(ConfigKeys.username, this.username);
    config.set(ConfigKeys.password, this.password);
    config.set(ConfigKeys.psk, this.psk);
    config.set(ConfigKeys.sshId, this.sshId);

    this.vpsService.updateApiKey(this.apiKey).then(() => {
      config.set(ConfigKeys.apiKey, this.apiKey);
      alert('Settings saved!'); // TODO: better alert management
    }).catch(err => {
      if (err.message) {
        alert(err.message);
        return;
      }
      alert('Api key is invalid');
    }).finally(() => {
      state.isHomeLoading = false;
    });

  }

  loadConfig() {
    this.apiKey = config.get(ConfigKeys.apiKey);
    this.username = config.get(ConfigKeys.username);
    this.password = config.get(ConfigKeys.password);
    this.psk = config.get(ConfigKeys.psk);
    this.sshId = config.get(ConfigKeys.sshId);
  }

  regenerateKeys() {
    this.connected = true;
    setTimeout(() => {
      this.connected = false;
    }, 5000);
    config.regenerateKeys();
    this.loadConfig();
  }
}
