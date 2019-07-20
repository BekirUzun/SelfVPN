import { Component, OnInit } from '@angular/core';
import { state } from '../../shared/state';
import { VpsService } from '../../providers/vps-service/vps.service';
import { errors } from '../../shared/errors';
import { ConfigService, ConfigKeys } from '../../providers/config-service/config.service';
import { LoggerService } from '../../providers/logger-service/logger.service';

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

  constructor(public vpsService: VpsService, public config: ConfigService, public logs: LoggerService) { }

  ngOnInit() {
   this.loadConfig();
  }

  save() {
    state.isHomeLoading = true;

    this.config.set(ConfigKeys.sshId, this.sshId);

    this.vpsService.updateApiKey(this.apiKey).then(() => {
      this.config.set(ConfigKeys.apiKey, this.apiKey);
      alert('Settings saved!'); // TODO: better user message displaying
      this.logs.appendLog('API key updated.');
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
  }

  loadConfig() {
    this.apiKey = this.config.get(ConfigKeys.apiKey);
    this.sshId = this.config.get(ConfigKeys.sshId);
  }

}
