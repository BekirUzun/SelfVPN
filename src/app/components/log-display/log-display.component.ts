import { Component, OnInit } from '@angular/core';
import { LogMessage, LoggerService } from '../../providers/logger-service/logger.service';

@Component({
  selector: 'app-log-display',
  templateUrl: './log-display.component.html',
  styleUrls: ['./log-display.component.scss']
})
export class LogDisplayComponent implements OnInit {

  isLogsHidden = false;
  logMessages: LogMessage[] = [];

  constructor(public logs: LoggerService) { }

  ngOnInit() {
   this.logMessages = this.logs.getLogs();
  }

  toggleVisibility() {
    this.isLogsHidden = !this.isLogsHidden;
  }

}
