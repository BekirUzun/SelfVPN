import { Component, OnInit } from '@angular/core';
import { state } from '../../shared/state';
import { VpsService } from '../../providers/vps-service/vps.service';
import { ConfigService, ConfigKeys } from '../../providers/config-service/config.service';
import { LoggerService } from '../../providers/logger-service/logger.service';
import { Events } from '../../shared/events';
import { NbDialogService } from '@nebular/theme';
import { DialogComponent } from '../../components/dialog/dialog.component';

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
  dialogRef;

  constructor(
    public vpsService: VpsService,
    public config: ConfigService,
    public events: Events,
    public logs: LoggerService,
    private dialogService: NbDialogService) { }

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
        this.displayAlert('Settings saved!');
        this.logs.appendLog('API key updated.');
        this.events.publish('config:apikey_update');
      }).catch(err => {
        if (err.message) {
          this.logs.appendLog(err.message);
          this.displayAlert(err.message);
          return;
        }
        this.logs.appendLog('API key is invalid.');
        this.displayAlert('Settings saved!');
      }).finally(() => {
        state.isHomeLoading = false;
      });
    } else {
      this.displayAlert('Settings saved!');
    }
  }

  displayAlert(message: string) {
    this.dialogRef = this.dialogService.open(DialogComponent, {
      context: {
        message: message,
        confirm: () => { this.dialogRef.close(); },
        // cancel: () => { this.dialogRef.close(); }
      },
    });
  }

  loadConfig() {
    this.apiKey = this.config.get(ConfigKeys.apiKey);
    this.sshId = this.config.get(ConfigKeys.sshId);
    this.autoDestroy = this.config.get(ConfigKeys.autoDestroy);
  }

}
