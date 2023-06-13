import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  // This is set by MainComponent.ngOnInit
  debug = 0; // 0 - no debugging, 1 - general, 2 - specific
  logged = new EventEmitter<string>();
  messages = new Array<string>();

  constructor() { }

  log(message: string, moduleName: string, functionName: string, level = 1) {
    if (this.debug === level) {

      let now = new Date();
      let ts = now.getHours().toFixed().padStart(2, '0') + ":" + now.getMinutes().toFixed().padStart(2, '0')
        + ":" + now.getSeconds().toFixed().padStart(2, '0');
      let log = ts + " " + moduleName + " " + functionName + ":\n" + message;
      // console.log(log);
      this.messages.unshift(log);
      this.logged.emit(log);
    }
  }
}
