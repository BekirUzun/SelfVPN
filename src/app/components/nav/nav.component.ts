import { Component } from '@angular/core';
import { NbWindowRef, NbWindowService } from '@nebular/theme';
import { SettingsComponent } from '../../pages/settings/settings.component';
import { remote } from 'electron';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  windowRef: NbWindowRef;
  constructor(private windowService: NbWindowService) {}

  closeApp() {
    window.close();
  }

  minimizeApp() {
    remote.BrowserWindow.getFocusedWindow().minimize();
  }
}
