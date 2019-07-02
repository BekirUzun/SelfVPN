import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { state } from './shared/state';
import { NbWindowService, NbWindowRef } from '@nebular/theme';
import { LogDisplayComponent } from './components/log-display/log-display.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  windowRef: NbWindowRef;

  constructor(public electronService: ElectronService,
    private translate: TranslateService,
    private windowService: NbWindowService) {

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

  isLoading() {
    return state.isHomeLoading;
  }

  showLogs() {
    this.windowRef = this.windowService.open(LogDisplayComponent, {
      title: `Logs`,
      closeOnBackdropClick: true,
      closeOnEsc: true,
      windowClass: 'custom-window',
    });

    this.windowRef.onClose.subscribe(() => {
      this.windowRef.componentRef.destroy();
      this.windowRef = undefined;
    });
  }
}
