import { Component, OnInit } from '@angular/core';
import { logs, LogMessage } from '../../shared/logger';

@Component({
  selector: 'app-log-display',
  templateUrl: './log-display.component.html',
  styleUrls: ['./log-display.component.scss']
})
export class LogDisplayComponent implements OnInit {

  isLogsHidden = false;
  logMessages: LogMessage[] = [];

  constructor() { }

  ngOnInit() {
   this.logMessages = logs.getLogs();
  }

  toggleVisibility() {
    this.isLogsHidden = !this.isLogsHidden;
  }

}
