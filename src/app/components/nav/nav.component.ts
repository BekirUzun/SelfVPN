import { Component } from '@angular/core';
import { remote } from 'electron';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  constructor() {}

  closeApp() {
    window.close();
  }

  minimizeApp() {
    remote.BrowserWindow.getFocusedWindow().minimize();
  }
}
