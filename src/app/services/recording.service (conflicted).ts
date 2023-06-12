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

  // To stop a function running more than once at the same time
  private isInitializing = false;
  private isInitialized = false;
  private initialized = new EventEmitter<void>();

  constructor(private ls: LoggerService) {
    this.stateChange.emit(RecordingState.UnInitialized);
    this.initialize();
  }

  // Initialize the MediaRecorder
  private async initialize() {
    let functionName = 'initialize';

    if (this.isInitializing) {
      // Already running
      return;
    }
    this.isInitializing = true;

    //Feature Detection
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      //Feature is not supported in browser
      //return a custom error
      this.ls.log('Error in RecordingService initialize: mediaDevices API or getUserMedia method is not supported in this browser.', this.moduleName, functionName);
      return;
    }
    //Feature is supported in browser
    this.stream =
      await navigator.mediaDevices.getUserMedia({ audio: true });
    this.recorder = new MediaRecorder(this.stream);
    RecordingService.recorderCount++;
    this.ls.log('recorderCount: ' + RecordingService.recorderCount, this.moduleName, functionName, 1);

    if (this.recorder.stream.active === false) {
      this.ls.log('Error in RecordingService initialize: stream not active', this.moduleName, functionName);
    }
    else {
      await this.setupListener();
      this.state = RecordingState.Stopped;
      this.stateChange.emit(this.state);
    }
    this.ls.log('Final state: ' + this.toString(), this.moduleName, functionName, 1);
    this.isInitializing = false;
    this.isInitialized = true;
    this.initialized.emit();
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

    let p = new Promise<void>((resolve, reject) => {
      if (!this.isInitialized) {
        let sub = this.initialized.subscribe(() => {
          sub.unsubscribe();
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
            this.ls.log(this.toString(), this.moduleName, functionName);
            this.recorder?.start();
            break;
        }

        if (this.recorder?.state !== "recording") {
          this.ls.log("Error in RecordingService start: Failed to record.", this.moduleName, functionName);
        }
        else {
          this.state = RecordingState.Recording;
          this.stateChange.emit(this.state);
        }
        this.ls.log('Final state: ' + this.toString(), this.moduleName, functionName, 1);
        resolve();
      }
    });
    return p;



  }

  async stop() {
    let functionName = 'stop';

    this.ls.log(this.toString(), this.moduleName, functionName);

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
        this.state = RecordingState.Stopped;
        this.stateChange.emit(this.state);
      }
      this.ls.log('Final state: ' + this.toString(), this.moduleName, functionName, 1);
    }




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
        this.state = RecordingState.Paused;
        this.stateChange.emit(this.state);
      }
      this.ls.log('Final state: ' + this.toString(), this.moduleName, functionName, 1);
    }

  }

  async restart() {
    let functionName = 'restart';

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
          this.ls.log('Error: Should be recording by here.', this.moduleName, functionName, 1);
          break;
        case RecordingState.Recording:
          this.recorder?.stop();
          this.recorder?.start();
          break;
        case RecordingState.Paused:
          this.recorder?.stop();
          this.recorder?.start();
          this.recorder?.pause();
          break;
        case RecordingState.Stopped:
          this.recorder?.start();
          break;
      }

      if (this.recorder?.state !== "recording") {
        this.ls.log('Error: Failed to start.', this.moduleName, functionName);
      }
      else {
        this.state = RecordingState.Recording;
        this.stateChange.emit(this.state);
      }
      this.ls.log('Final state: ' + this.toString(), this.moduleName, functionName, 1);
    }


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
      + ", recorder null: " + (this.recorder === null ? "null" : "not")
      + ", stream null: " + (this.stream === null)
      + ", stream active: " + (this.stream?.active)
      + ", MediaRecorder state: " + this.recorder?.state
      + ", number of tracks: " + this.stream?.getTracks().length
      + ", track 1: " + this.stream?.getTracks()[0].readyState;
    return status;
  }

}

export enum RecordingState {
  UnInitialized = "UnInitialized",
  Stopped = "Stopped",
  Recording = "Recording",
  Paused = "Paused"

}
