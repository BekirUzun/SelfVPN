import { Component, OnInit } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { state } from './shared/state';
import { NbWindowService } from '@nebular/theme';
import { LogDisplayComponent } from './components/log-display/log-display.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ConfigService, ConfigKeys } from './providers/config-service/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(public electronService: ElectronService,
    private translate: TranslateService,
    private windowService: NbWindowService,
    public config: ConfigService) {

    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  ngOnInit() {
    if (!this.config.get(ConfigKeys.apiKey)) {
      this.openSettings();
    }
  }

  isLoading() {
    return state.isHomeLoading;
  }

  openSettings() {
    this.windowService.open(SettingsComponent, {
      title: `Settings`,
      closeOnBackdropClick: true,
      closeOnEsc: true,
      windowClass: 'custom-window',
    });
  }

  showLogs() {
    this.windowService.open(LogDisplayComponent, {
      title: `Logs`,
      closeOnBackdropClick: true,
      closeOnEsc: true,
      windowClass: 'custom-window',
    });
  }
}
