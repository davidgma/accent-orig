import { Component, EventEmitter } from '@angular/core';
import { LoggerService } from 'src/app/services/logger.service';
import { PlaybackService, PlayingState } from 'src/app/services/playback.service';
import { RecordingService, RecordingState } from 'src/app/services/recording.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  private moduleName = 'MainComponent';

  // Colours for icons
  defaultColour = "black";
  selectedColour = "red";

  // Colour for main background
  backgroundColor = "ivory";

  // To stop a function running more than once at the same time
  // private isGainingFocus = false;
  // private isLosingFocus = false;

  private audioAsBlob = new Blob();

  constructor(public rs: RecordingService, public ps: PlaybackService, private ls: LoggerService) { }

  ngOnInit() {
    let functionName = 'ngOnInit';

    // Set debug mode
    this.ls.debug = 1;

    window.addEventListener("focus", () => {
      this.ls.log('Window gained focus', this.moduleName, functionName);
      this.lockedGainedFocus();
    });
    window.addEventListener("pageshow", () => {
      this.ls.log('Window pageshow', this.moduleName, functionName);
      this.lockedGainedFocus();
    });
    window.addEventListener("blur", () => {
      this.ls.log('Window lost focus', this.moduleName, functionName);
      this.lockedLostFocus();
    });
    window.addEventListener("pagehide", () => {
      this.ls.log('Window pagehide', this.moduleName, functionName);
      this.lockedLostFocus();
    });
    document.onvisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        this.ls.log('Document hidden', this.moduleName, functionName);
        this.lockedLostFocus();
      }
      if (document.visibilityState === "visible") {
        this.ls.log('Document visible', this.moduleName, functionName);
        this.lockedGainedFocus();
      }
    }

    // Setup the audio part - this can only be done once
    // the template is active
    this.ps.setupAudio();

    this.logStates();
    this.monitorStates();

  }

  private lockedLostFocus = this.ls.lock(this.lostFocus, this);
  async lostFocus() {
    let functionName = 'lostFocus';
    this.ls.log('Called. ', this.moduleName, functionName, 1);

    if (this.rs.state !== RecordingState.Stopped) {
      await this.rs.stop();
    }
    // this.isLosingFocus = false;
    this.ls.log('Final. ', this.moduleName, functionName, 1);
  }

  private lockedGainedFocus = this.ls.lock(this.gainedFocus, this);
  async gainedFocus() {
    let functionName = 'gainedFocus';

    this.ls.log('Calling start...', this.moduleName, functionName, 1);
    await this.rs.start();
    this.ls.log('Calling pause...', this.moduleName, functionName, 1);
    await this.rs.pause();

  }

  private logStates() {
    let functionName = 'logStates';
    this.ls.log("RecordingService state: " + this.rs.state, this.moduleName, functionName);
    this.ls.log("PlaybackService state: " + this.ps.state, this.moduleName, functionName);
  }

  togglePlay = this.ls.lock(this.togglePlayLocked, this);
  private async togglePlayLocked() {
    let functionName = 'togglePlayLocked';
    this.ls.log('Called.', this.moduleName, functionName, 1);

    // Assume that any additional spurious calls
    // e.g. from mousedown and click
    // will happen within a short period of time
    return new Promise<void>(async (resolve, reject) => {
      this.play(); // don't await because we need to be able to cancel
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  private async play() {
    let functionName = 'play';
    this.ls.log('play', this.moduleName, functionName);

    return new Promise<void>(async (resolve, reject) => {

      // Cancel any audio currently playing
      if (this.ps.state === PlayingState.Playing) {
        this.ps.cancel();
        resolve();
        return;
      }

      // If it's currently recording, stop the
      // recording and wait for the blob to be ready
      if (this.rs.state === RecordingState.Recording) {
        let blob = await this.rs.getData();

        this.ps.play(blob, this.rs.currentTime);
      }
      else if (this.audioAsBlob.size === 0) {
        resolve();
        return;
      }
      else {
        await this.ps.play(this.audioAsBlob, this.rs.currentTime);
        this.ls.log('Finished playing audio', this.moduleName, functionName);
        resolve();
      }
      resolve();
    });


  }

  toggleRecord = this.ls.lock(this.toggleRecordLocked, this);
  private async toggleRecordLocked() {
    let functionName = 'toggleRecordLocked';
    this.ls.log('Called.', this.moduleName, functionName, 1);

    // Assume that any additional spurious calls
    // e.g. from mousedown and click
    // will happen within a short period of time
    return new Promise<void>(async (resolve, reject) => {
      this.record(); // don't await because we need to be able to cancel
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  private async record() {
    let functionName = 'record';
    this.ls.log('record', this.moduleName, functionName);

    return new Promise<void>(async (resolve, reject) => {
      // Check that the recorder is recording
      if (this.rs.state !== RecordingState.Recording) {
        await this.rs.start();
      }

      // Stop any current playing audio
      if (this.ps.state === PlayingState.Playing) {
        this.ps.cancel();
      }

      switch (this.rs.state) {
        case RecordingState.Paused:
          this.rs.start();
          break;
        case RecordingState.Recording:
          this.audioAsBlob = await this.rs.getData();
          this.ls.log('Blob received size ' + this.audioAsBlob.size, this.moduleName, functionName, 1);
          this.rs.pause();
          break;
        case RecordingState.Stopped:
          this.rs.start();
          break;
        case RecordingState.UnInitialized:
          this.rs.start();
      }
    });

  }

  private monitorStates() {
    this.rs.stateChange.subscribe((state: RecordingState) => {
      switch (state) {
        case RecordingState.Paused:
          this.backgroundColor = "ivory";
          break;
        case RecordingState.Recording:
          this.backgroundColor = "firebrick";
          break;
        case RecordingState.Stopped:
          this.backgroundColor = "ivory";
          break;
      }
    });

    this.ps.stateChange.subscribe((state: PlayingState) => {
      switch (state) {
        case PlayingState.Playing:
          this.backgroundColor = "mediumseagreen";
          break;
        case PlayingState.Ready:
          this.backgroundColor = "ivory";
      }
    });

  }

  // For debugging screen touching
  recordMousedown() {
    let functionName = 'recordMousedown';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    this.toggleRecord();
  }
  recordDrag() {
    let functionName = 'recordDrag';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    this.toggleRecord();
  }
  recordDblClick() {
    let functionName = 'recordDblClick';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    this.toggleRecord();
  }
  recordTouchmove() {
    let functionName = 'recordTouchmove';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    this.toggleRecord();
  }
  recordTouchstart() {
    let functionName = 'recordTouchstart';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    this.toggleRecord();
  }

  playMousedown() {
    let functionName = 'playMousedown';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    this.togglePlay();
  }
  playDrag() {
    let functionName = 'playDrag';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    this.togglePlay();
  }
  playDblClick() {
    let functionName = 'playDblClick';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    this.togglePlay();
  }
  playTouchmove() {
    let functionName = 'playTouchmove';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    this.togglePlay();
  }
  playTouchstart() {
    let functionName = 'playTouchstart';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    this.togglePlay();
  }

}



