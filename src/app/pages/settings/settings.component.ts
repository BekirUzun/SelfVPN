import { Component, OnInit } from '@angular/core';
import { config, ConfigKeys } from '../../shared/config';
import { state } from '../../shared/state';

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
  connected = false;

  constructor() { }

  ngOnInit() {
   this.loadConfig();
  }

  save() {
    state.isHomeLoading = true;
    config.set(ConfigKeys.apiKey, this.apiKey);
    config.set(ConfigKeys.username, this.username);
    config.set(ConfigKeys.password, this.password);
    config.set(ConfigKeys.psk, this.psk);
    setTimeout(() => {
      state.isHomeLoading = false;
    }, 2000);
  }

  loadConfig() {
    this.apiKey = config.get(ConfigKeys.apiKey);
    this.username = config.get(ConfigKeys.username);
    this.password = config.get(ConfigKeys.password);
    this.psk = config.get(ConfigKeys.psk);
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
