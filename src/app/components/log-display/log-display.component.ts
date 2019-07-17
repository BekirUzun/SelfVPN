import { Component, OnInit } from '@angular/core';
import { LoggerService } from '../../providers/logger-service/logger.service';
import { LogMessage } from '../../models/log-message';

@Component({
  selector: 'app-log-display',
  templateUrl: './log-display.component.html',
  styleUrls: ['./log-display.component.scss']
})
export class LogDisplayComponent implements OnInit {

  logMessages: LogMessage[] = [];

  constructor(public logs: LoggerService) { }

  ngOnInit() {
    this.logMessages = this.logs.getLogs();
  }

}
