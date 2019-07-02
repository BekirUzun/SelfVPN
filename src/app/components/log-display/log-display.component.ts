import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-log-display',
  templateUrl: './log-display.component.html',
  styleUrls: ['./log-display.component.scss']
})
export class LogDisplayComponent implements OnInit {

  isLogsHidden = false;
  logMessages: {
    date: string,
    text: string
  }[] = [];

  constructor() { }

  ngOnInit() {
    this.logMessages.push({date: 'asd', text: 'Hello world'});
    this.logMessages.push({date: 'asd', text: 'Nice day'});
  }

  public appendLog(messageText: string) {
    this.logMessages.push({date: 'asd', text: messageText});
  }

  toggleVisibility() {
    this.isLogsHidden = !this.isLogsHidden;
  }

}
