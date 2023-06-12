import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  public debug = 0; // 0 - no debugging, 1 - general, 2 - specific

  constructor() { }

  log(message: string, moduleName: string, functionName: string, level = 1) {
    if (this.debug === level) {

      let now = new Date();
      let ts = now.getHours().toFixed().padStart(2, '0') + ":" + now.getMinutes().toFixed().padStart(2, '0')
        + ":" + now.getSeconds().toFixed().padStart(2, '0')
      console.log(ts + " " + moduleName + " " + functionName + ":\n" + message);
    }
  }
}
