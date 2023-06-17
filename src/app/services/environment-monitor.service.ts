import { EventEmitter, Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentMonitorService {
  private moduleName = 'EnvironmentMonitorService';

  onFocus = new EventEmitter<void>();
  onUnfocus = new EventEmitter<void>();

  constructor(private ls: LoggerService) {
    let functionName = 'constructor';


    window.addEventListener("focus", () => {
      this.ls.log('Window gained focus', this.moduleName, functionName);
      this.onFocus.emit();
    });
    window.addEventListener("pageshow", () => {
      this.ls.log('Window pageshow', this.moduleName, functionName);
      this.onFocus.emit();
    });
    window.addEventListener("blur", () => {
      this.ls.log('Window lost focus', this.moduleName, functionName);
      this.onUnfocus.emit();
    });
    window.addEventListener("pagehide", () => {
      this.ls.log('Window pagehide', this.moduleName, functionName);
      this.onUnfocus.emit();
    });

    document.onvisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        this.ls.log('Document hidden', this.moduleName, functionName);
        this.onUnfocus.emit();
      }
      if (document.visibilityState === "visible") {
        this.ls.log('Document visible', this.moduleName, functionName);
        this.onFocus.emit();
      }
    }
  }


}
