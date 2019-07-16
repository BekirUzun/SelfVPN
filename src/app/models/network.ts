import { Utils } from '../shared/utils';

export class NetworkStatus {

  Upload: {
    TotalMB: number,
    Speed: number
  };
  Download: {
    TotalMB: number,
    Speed: number
  };

  constructor() {
    this.Download = {
      TotalMB: 0,
      Speed: 0
    };

    this.Upload = {
      TotalMB: 0,
      Speed: 0
    };
  }

  update(parsedObj: NetworkStatus) {
    this.Download.Speed = parsedObj.Download.Speed;
    this.Download.TotalMB = parsedObj.Download.TotalMB;
    this.Upload.Speed = parsedObj.Upload.Speed;
    this.Upload.TotalMB = parsedObj.Upload.TotalMB;
  }

  reset() {
    this.Download.Speed = 0;
    this.Download.TotalMB = 0;
    this.Upload.Speed = 0;
    this.Upload.TotalMB = 0;
  }

  getDownloadSpeed(): string {
    return Utils.getFormattedUnit(this.Download.Speed, 'KB/s');
  }
  getUploadSpeed(): string {
    return Utils.getFormattedUnit(this.Upload.Speed, 'KB/s');
  }
  getTotalDownload(): string {
    return Utils.getFormattedUnit(this.Download.TotalMB, 'MB');
  }
  getTotalUpload(): string {
    return Utils.getFormattedUnit(this.Upload.TotalMB, 'MB');
  }

}
