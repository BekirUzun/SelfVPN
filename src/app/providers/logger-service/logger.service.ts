import { Injectable } from '@angular/core';
import { LogMessage } from '../../models/log-message';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  logMessages: LogMessage[] = [];

  constructor() { }

  public appendLog(messageText: string) {
    // TODO: add persistent logs
    console.log(messageText);
    this.logMessages.push(new LogMessage(messageText));
  }

  getLogs(): LogMessage[] {
    return this.logMessages;
  }
}
