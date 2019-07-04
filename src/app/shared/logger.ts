export class LogMessage {
    date: Date;
    text: string;
}

class Logger {
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
export const logs = new Logger();
