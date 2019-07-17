export class LogMessage {
  date: Date;
  text: string;

  constructor(text: string) {
    this.date = new Date();
    this.text = text;
  }

  getShortDate(): string {
    return '' + this.date.getUTCHours() + ':' + this.date.getUTCMinutes() + ':' + this.date.getSeconds();
  }

  getFullDate(): string {
    return this.date.toUTCString();
  }
}
