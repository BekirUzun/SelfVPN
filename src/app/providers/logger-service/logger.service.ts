import { Injectable } from '@angular/core';

export class LogMessage {
  date: Date;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  logMessages: LogMessage[] = [];

  constructor() { }

  public appendLog(messageText: string) {
       // TODO: add persistent logs
      console.log(messageText);
      this.logMessages.push({date: new Date(), text: messageText});
  }

  getLogs(): LogMessage[] {
      return this.logMessages;
  }
}
