import { Component, OnInit } from '@angular/core';
import { state } from '../../shared/state';
import { VpsService } from '../../providers/vps-service/vps.service';
import { errors } from '../../shared/errors';
import { ConfigService, ConfigKeys } from '../../providers/config-service/config.service';
import { LoggerService } from '../../providers/logger-service/logger.service';
import { Events } from '../../shared/events';

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
  autoDestroy: boolean;

  constructor(
    public vpsService: VpsService,
    public config: ConfigService,
    public events: Events,
    public logs: LoggerService) { }

  ngOnInit() {
   this.loadConfig();
  }

  save() {


    this.config.set(ConfigKeys.sshId, this.sshId);
    this.config.set(ConfigKeys.autoDestroy, this.autoDestroy);

    if (this.apiKey !== this.config.get(ConfigKeys.apiKey)) {
      state.isHomeLoading = true;
      this.vpsService.updateApiKey(this.apiKey).then(() => {
        this.config.set(ConfigKeys.apiKey, this.apiKey);
        alert('Settings saved!'); // TODO: better user message displaying
        this.logs.appendLog('API key updated.');
        this.events.publish('config:apikey_update');
      }).catch(err => {
        if (err.message) {
          this.logs.appendLog(err.message);
          alert(err.message);
          return;
        }
        this.logs.appendLog('API key is invalid.');
        alert('API key is invalid'); // TODO: better user message displaying
      }).finally(() => {
        state.isHomeLoading = false;
      });
    } else {
      alert('Settings saved!');
    }
  }

  loadConfig() {
    this.apiKey = this.config.get(ConfigKeys.apiKey);
    this.sshId = this.config.get(ConfigKeys.sshId);
    this.autoDestroy = this.config.get(ConfigKeys.autoDestroy);
  }

}
