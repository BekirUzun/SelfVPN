import { Injectable } from '@angular/core';
import { LogMessage } from '../../models/log-message';
import * as electron from 'electron';
import * as path from 'path';
import * as fs from 'fs';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  logMessages: LogMessage[] = [];
  path: string;

  constructor() {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    this.path = path.join(userDataPath, 'logs.txt');
  }

  public appendLog(messageText: string) {
    console.log(messageText);
    let newEntry = new LogMessage(messageText);
    this.logMessages.push(newEntry);
    let logLine = '[' + newEntry.date.toJSON() + '] - ' + messageText + '\n';
    fs.appendFileSync(this.path, logLine);
  }

  getLogs(): LogMessage[] {
    return this.logMessages;
  }


}
