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

  // To stop a function running more than once at the same time
  private isGainingFocus = false;
  private isLosingFocus = false;

  private audioAsBlob = new Blob();

  constructor(public rs: RecordingService, public ps: PlaybackService, private ls: LoggerService) { }

  ngOnInit() {
    let functionName = 'ngOnInit';

    // Set debug mode
    this.ls.debug = 0;

    window.addEventListener("focus", () => {
      this.ls.log('Window gained focus', this.moduleName, functionName);
      this.gainedFocus();
    });
    window.addEventListener("pageshow", () => {
      this.ls.log('Window pageshow', this.moduleName, functionName);
      this.gainedFocus();
    });
    window.addEventListener("blur", () => {
      this.ls.log('Window lost focus', this.moduleName, functionName);
      this.lostFocus();
    });
    window.addEventListener("pagehide", () => {
      this.ls.log('Window pagehide', this.moduleName, functionName);
      this.lostFocus();
    });
    document.onvisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        this.ls.log('Document hidden', this.moduleName, functionName);
        this.lostFocus();
      }
      if (document.visibilityState === "visible") {
        this.ls.log('Document visible', this.moduleName, functionName);
        this.gainedFocus();
      }
    }

    // Setup the audio part - this can only be done once
    // the template is active
    this.ps.setupAudio();

    this.logStates();

  }

  async lostFocus() {
    let functionName = 'lostFocus';
    this.ls.log('Called. ', this.moduleName, functionName, 1);

    if (this.isLosingFocus === true) {
      return;
    }
    this.isLosingFocus = true;
    if (this.rs.state !== RecordingState.Stopped) {
      await this.rs.stop();
    }
    this.isLosingFocus = false;
    this.ls.log('Final. ', this.moduleName, functionName, 1);
  }

  async gainedFocus() {
    let functionName = 'gainedFocus';

    if (this.isGainingFocus === true) {
      return;
    }
    this.isGainingFocus = true;

    this.ls.log('Calling start...', this.moduleName, functionName, 1);
    await this.rs.start();
    this.ls.log('Calling pause...', this.moduleName, functionName, 1);
    this.rs.pause();

    this.isGainingFocus = false;
    // this.focused.emit();
  }

  private logStates() {
    let functionName = 'logStates';
    this.ls.log("RecordingService state: " + this.rs.state, this.moduleName, functionName);
    this.ls.log("PlaybackService state: " + this.ps.state, this.moduleName, functionName);
  }

  async play() {
    let functionName = 'play';
    this.ls.log('play', this.moduleName, functionName);

    // Cancel any audio currently playing
    if (this.ps.state === PlayingState.Playing) {
      this.ps.cancel();
    }

    // If it's currently recording, stop the
    // recording and wait for the blob to be ready
    if (this.rs.state === RecordingState.Recording) {
      // this.rs.stop();
      let blob = await this.rs.getData();

      this.ps.play(blob);
      // this.ls.log('Calling restart 1', this.moduleName, functionName, 1);
      // this.rs.restart();
    }
    else if (this.audioAsBlob.size === 0) {
      return;
    }
    else {
      // this.ls.log('Calling restart 2', this.moduleName, functionName, 1);
      // this.rs.restart();
      await this.ps.play(this.audioAsBlob);
      this.ls.log('Finished playing audio', this.moduleName, functionName);
    }

  }

  async record() {
    let functionName = 'record';
    this.ls.log('record', this.moduleName, functionName);

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

  }


  /** Stores the actual start time when an audio recording begins to take place to ensure elapsed time start time is accurate*/
  private audioRecordStartTime = new Date();

  /** Stores the maximum recording time in hours to stop recording once maximum recording hour has been reached */
  private maximumRecordingTimeInHours = 1;

  /** Stores the reference of the setInterval function that controls the timer in audio recording*/
  private elapsedTimeTimer: any = null;


}



