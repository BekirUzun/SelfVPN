
export class Utils {

  static getFormattedUnit(rawSpeed, rawUnit = 'KB'): string {
    let upperUnit;
    if (rawUnit.includes('s'))
      upperUnit = (rawUnit === 'KB/s') ? 'MB/s' : 'GB/s';
    else
      upperUnit = (rawUnit === 'KB') ? 'MB' : 'GB';

    if (rawSpeed > 1000) {
      let displaySpeed = rawSpeed / 1000;
      let precision = 0;

      if (displaySpeed < 100)
        precision = 1;

      return displaySpeed.toFixed(precision) + ' ' + upperUnit;
    } else
      return rawSpeed.toFixed(0) + ' ' + rawUnit;
  }

}
