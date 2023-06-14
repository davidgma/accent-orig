import { EventEmitter, Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  private moduleName = 'RecordingService';

  private static recorderCount = 0;
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  state: RecordingState = RecordingState.UnInitialized;
  stateChange = new EventEmitter<RecordingState>();
  private dataReady = new EventEmitter<Blob>();
  private blobs = new Array<Blob>();
  private mimeType: string | undefined = undefined;

  // To stop a function running more than once at the same time
  private isInitializing = false;
  private isInitialized = false;
  private initialized = new EventEmitter<void>();

  private startTime = new Date();
  private latestRecordingDuration = 0; // milliseconds
  public currentTime = 0; // seconds, time to start playing

  constructor(private ls: LoggerService) {
    this.stateChange.emit(RecordingState.UnInitialized);
    this.initialize();
    this.monitorTime();
  }

  // Initialize the MediaRecorder
  private async initialize() {
    let functionName = 'initialize';

    if (this.isInitializing) {
      // Already running
      return;
    }
    this.isInitializing = true;

    let p = new Promise<void>((resolve, reject) => {
      //Feature Detection
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        //Feature is not supported in browser
        //return a custom error
        this.ls.log('Error in RecordingService initialize: mediaDevices API or getUserMedia method is not supported in this browser.', this.moduleName, functionName);
        reject();
        return;
      }
      //Feature is supported in browser
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.stream = stream;
        this.recorder = new MediaRecorder(stream);
        RecordingService.recorderCount++;
        this.ls.log('recorderCount: ' + RecordingService.recorderCount, this.moduleName, functionName, 1);

        if (this.recorder.stream.active === false) {
          this.ls.log('Error in RecordingService initialize: stream not active', this.moduleName, functionName);
          reject();
          return;
        }
        else {
          this.setupListener();
          this.state = RecordingState.Stopped;
          this.stateChange.emit(this.state);
        }
        this.ls.log('Final: ' + this.toString(), this.moduleName, functionName, 1);
        this.isInitializing = false;
        this.isInitialized = true;
        this.initialized.emit();
        resolve();
      });

    });
    return p;

  }

  async setupListener() {
    let functionName = 'setupListener';

    this.recorder?.addEventListener("dataavailable", (event) => {
      let blob: Blob = event.data;
      this.ls.log("blob gathered size: " + blob.size, this.moduleName, functionName);

      if (blob.size > 0) {
        this.blobs.push(blob);
        for (let b of this.blobs) {
          this.ls.log("blob sizes: " + b.size, this.moduleName, functionName);
        }
        let mimeType = this.recorder?.mimeType;
        // console.log("mimeType: " + mimeType);
        this.mimeType = mimeType;

        let combined = new Blob(this.blobs, { type: mimeType });
        this.ls.log("total size: " + combined.size, this.moduleName, functionName);

        // this.playBlob(combined);
        this.dataReady.emit(combined);
        // }
      }
    });
  }

  async start() {
    let functionName = 'start';
    this.ls.log('Called ' + this.toString(), this.moduleName, functionName, 1);

    let p = new Promise<void>((resolve, reject) => {
      if (!this.isInitialized && !this.isInitializing) {
        this.initialize();
      }

      if (!this.isInitialized) {
        // this.ls.log('not initialized', this.moduleName, functionName, 1);
        let sub = this.initialized.subscribe(() => {
          sub.unsubscribe();
          // this.ls.log('initialized event returned', this.moduleName, functionName, 1);
          this.start().then(() => {
            resolve();
          });
        });
      }
      else {
        // should be initialized by now
        switch (this.state) {
          case RecordingState.UnInitialized:
            this.ls.log('Error: Should be initialized by here.', this.moduleName, functionName, 1);
            break;
          case RecordingState.Recording:
            break;
          case RecordingState.Paused:
            this.recorder?.resume();
            break;
          case RecordingState.Stopped:
            this.recorder?.start();
            break;
        }

        if (this.recorder?.state !== "recording") {
          this.ls.log("Error in RecordingService start: Failed to record.", this.moduleName, functionName);
        }
        else {
          if (this.state !== RecordingState.Recording) {
            this.state = RecordingState.Recording;
            this.stateChange.emit(this.state);
          }
        }
        this.ls.log('Final: ' + this.toString(), this.moduleName, functionName, 1);
        resolve();
      }

    });

    return p;
  }

  async stop() {
    let functionName = 'stop';
    this.ls.log(this.toString(), this.moduleName, functionName);

    let p = new Promise<void>((resolve, reject) => {
      if (!this.isInitialized) {
        let sub = this.initialized.subscribe(() => {
          sub.unsubscribe();
          this.stop().then(() => {
            resolve();
          });
        });
      }
      else {
        // should be initialized by now
        switch (this.state) {
          case RecordingState.UnInitialized:
            this.ls.log('Error: Should be initialized by here.', this.moduleName, functionName, 1);
            break;
          case RecordingState.Recording:
            this.stopAll();
            break;
          case RecordingState.Paused:
            this.stopAll();
            break;
          case RecordingState.Stopped:
            break;
        }

        if (this.recorder?.state !== "inactive") {
          this.ls.log("Error: Failed to stop.", this.moduleName, functionName);
        }
        else {
          if (this.state !== RecordingState.Stopped) {
            this.state = RecordingState.Stopped;
            this.stateChange.emit(this.state);
          }
        }
        this.ls.log('Final: ' + this.toString(), this.moduleName, functionName, 1);
        resolve();
      }
    });
    return p;

  }

  async pause() {
    let functionName = 'pause';

    if (!this.isInitialized) {
      let sub = this.initialized.subscribe(() => {
        sub.unsubscribe();
        this.stop();
      });
    }
    else {
      // should be initialized by now
      switch (this.state) {
        case RecordingState.UnInitialized:
          this.ls.log('Error: Should be initialized by here.', this.moduleName, functionName, 1);
          break;
        case RecordingState.Recording:
          this.recorder?.pause();
          break;
        case RecordingState.Paused:
          break;
        case RecordingState.Stopped:
          this.recorder?.pause();
          break;
      }

      if (this.recorder?.state !== "paused") {
        this.ls.log('Error: Failed to pause.', this.moduleName, functionName);
      }
      else {
        if (this.state !== RecordingState.Paused) {
          this.state = RecordingState.Paused;
          this.stateChange.emit(this.state);
        }

      }
      this.ls.log('Final: ' + this.toString(), this.moduleName, functionName, 1);
    }

  }

  async restart() {
    let functionName = 'restart';
    this.ls.log('Called. ' + this.toString(), this.moduleName, functionName, 1);

    let p = new Promise<void>(async (resolve, reject) => {

      if (!this.isInitialized && !this.isInitializing) {
        this.initialize();
      }

      if (!this.isInitialized) {
        let sub = this.initialized.subscribe(() => {
          sub.unsubscribe();
          this.restart().then(() => {
            resolve();
          });
        });
      }
      else {
        // should be initialized by now
        switch (this.state) {
          case RecordingState.UnInitialized:
            this.ls.log('Error: Should be initialized by here.', this.moduleName, functionName, 1);
            break;
          case RecordingState.Recording:
            await this.stop();
            await this.start();
            break;
          case RecordingState.Paused:
            this.ls.log('Calling stop. ' + this.toString(), this.moduleName, functionName, 1);
            await this.stop();
            this.ls.log('stop returned, calling start ' + this.toString(), this.moduleName, functionName, 1);
            await this.start();
            this.ls.log('start has returned, calling pause ' + this.toString(), this.moduleName, functionName, 1);
            await this.pause();
            break;
          case RecordingState.Stopped:
            await this.start();
            break;
        }

        this.ls.log('then: ' + this.toString(), this.moduleName, functionName, 1);
        if (this.recorder?.state !== "recording" &&
          this.recorder?.state !== "paused") {
          this.ls.log('Error: Failed to start.', this.moduleName, functionName);
        }

        this.ls.log('Final: ' + this.toString(), this.moduleName, functionName, 1);
        resolve();


      }
    });
    return p;

  }

  async getData(): Promise<Blob> {
    let functionName = 'getData';

    let p = new Promise<Blob>((resolve, reject) => {

      // It should be recording
      if (this.state !== RecordingState.Recording) {
        this.ls.log('Error: Not recording.' + this.toString(), this.moduleName, functionName);
        reject();
        return;
      }

      // Request data from recorder
      this.recorder?.requestData();
      let sub = this.dataReady.subscribe((blob) => {
        this.ls.log('Blob received size ' + blob.size, this.moduleName, functionName, 1);
        sub.unsubscribe();
        resolve(blob);
      });

    });
    return p;

  }

  private stopAll() {
    let functionName = 'stopAll';

    this.ls.log('Stopping media recorder...', this.moduleName, functionName);
    this.recorder?.stop();
    //stop all the tracks on the active stream in order to stop the stream
    this.stopStream();

    this.ls.log('Should be stopped. ' + this.toString(), this.moduleName, functionName, 1);

    this.isInitialized = false;
    this.blobs = new Array<Blob>();
  }

  /* Stop all the tracks on the active stream in order to stop the stream and remove
  * the red flashing dot showing in the tab
  */
  private stopStream() {

    //stopping the capturing request by stopping all the tracks on the active stream
    this.stream?.getTracks() //get all tracks from the stream
      .forEach(track /*of type MediaStreamTrack*/ => track.stop()); //stop each one
  }

  toString() {
    let status = "state: " + this.state
      + ", initialized: " + this.isInitialized
      + ", isInitializing: " + this.isInitializing
      + ", recorder: " + (this.recorder === null ? "null" : "instance")
      + ", stream: " + (this.stream === null ? "null" : "instance")
      + ", stream: " + (this.stream?.active ? "active" : "inactive")
      + ", MediaRecorder state: " + this.recorder?.state
      + ", number of tracks: " + this.stream?.getTracks().length
      + ", track 1: " + this.stream?.getTracks()[0].readyState;
    return status;
  }

  private monitorTime() {
    let functionName = 'monitorTime';

    this.stateChange.subscribe((state: RecordingState) => {
      if (state === RecordingState.Recording) {
        // move the currentTime forward
        this.currentTime += this.latestRecordingDuration / 1000;
        // set the start time to measure the latest recording
        this.startTime = new Date();
      }

      if (state === RecordingState.Paused) {
        let ended = new Date();
        this.latestRecordingDuration =
          (ended.valueOf() - this.startTime.valueOf());
        this.ls.log('latestRecordingDuration: ' + this.latestRecordingDuration, this.moduleName, functionName, 1);
      }
    });
  }

  getMimeType(): string {

    let ret = "Undefined: No recording data yet."
    if (this.mimeType !== undefined) {
      ret = this.mimeType;
    }
    // console.log("in getMimeType, returning " + ret);
    return ret;
  }



}

export enum RecordingState {
  UnInitialized = "UnInitialized",
  Stopped = "Stopped",
  Recording = "Recording",
  Paused = "Paused"

}
