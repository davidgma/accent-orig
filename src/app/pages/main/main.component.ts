import { Component } from '@angular/core';
import { EnvironmentMonitorService } from 'src/app/services/environment-monitor.service';
import { LoggerService } from 'src/app/services/logger.service';
import { PlaybackService, PlayingState } from 'src/app/services/playback.service';
import { RecordingService, RecordingState } from 'src/app/services/recording.service';
import { SettingEvent, SettingsService, Setting } from 'src/app/services/settings.service';

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

  iconSize = 8;
  justifyContent = "center";
  alignItems = "center";
  direction = "column";

  private audioAsBlob = new Blob();

  constructor(public rs: RecordingService,
    public ps: PlaybackService,
    private ls: LoggerService,
    private em: EnvironmentMonitorService,
    private ss: SettingsService) {

    let functionName = 'constructor';
    this.ls.log('Called.', this.moduleName, functionName, 1);


    // Start listening for events
    this.monitorStates();
    this.monitorEnvironment();
    this.monitorSettings();

    // iOS doesn't seem to call a gainedFocus
    // at the start or after a refresh so
    // it needs to be done manually
    this.ls.log('document has focus: ' + document.hasFocus(), this.moduleName, functionName, 1);
    if (document.hasFocus()) {
      this.em.onFocus.emit();
    }

    this.setIconPosition();
    this.setDirection();

  }

  ngOnInit() {
    // Setup the audio part - this can only be done once
    // the template is active
    this.ps.setupAudio();
    this.logStates();

  }

  monitorEnvironment() {
    this.em.onFocus.subscribe(() => {
      this.lockedGainedFocus();
    });
    this.em.onUnfocus.subscribe(() => {
      this.lockedLostFocus();
    });
  }

  monitorSettings() {
    let functionName = 'monitorSettings';
    this.ls.log('Called.', this.moduleName, functionName, 1);

    let s = <Setting<boolean>>this.ss.settings.get("centralIcon");

    s.onChange.subscribe((event) => {

      this.ls.log('centralIcon 2 setting changed from '
        + event.from + " to "
        + event.to, this.moduleName, functionName, 1);

      this.setIconPosition();

    });

    let p = <Setting<boolean>>this.ss.settings.get("portrait");

    p.onChange.subscribe((event) => {

      this.ls.log('portrait setting changed from '
        + event.from + " to "
        + event.to, this.moduleName, functionName, 1);

      this.setDirection();

    });
  }

  private setIconPosition() {
    let s = <Setting<boolean>>this.ss.settings.get("centralIcon");
    if (s.value === true) {
      this.justifyContent = "center";
      this.alignItems = "center"
      this.iconSize = 20;
    }
    else {
      this.justifyContent = "left";
      this.alignItems = "top"
      this.iconSize = 8;
    }
  }

  private setDirection() {
    let p = <Setting<boolean>>this.ss.settings.get("portrait");
    if (p.value === true) {
      this.direction = "column";
    }
    else {
      this.direction = "row";
    }
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
    this.ps.setupAudio();

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
      }, 100);
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
      // recording and wait for the blob to be ready,
      // and give it a little extra time to finish
      if (this.rs.state === RecordingState.Recording) {

        // Give it a little time to finish
        await new Promise(resolve => setTimeout(resolve, 200));

        let blob = await this.rs.getData();
        this.audioAsBlob = blob;
        this.rs.pause();
        this.playAudioBlob();
      }
      else if (this.audioAsBlob.size !== 0) {
        this.playAudioBlob();
      }
      resolve();
    });

  }

  private async playAudioBlob() {
    let functionName = 'playAudioBlob';

    await this.ps.play(this.audioAsBlob, this.rs.currentTime);
    this.ls.log('Finished playing audio blob', this.moduleName, functionName);
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
      }, 100);
    });
  }

  private async record() {
    let functionName = 'record';
    this.ls.log('record', this.moduleName, functionName);

    return new Promise<void>(async (resolve, reject) => {
      // Check that the recorder is recording
      // if (this.rs.state !== RecordingState.Recording) {
      //   await this.rs.start();
      // }

      // Stop any current playing audio
      if (this.ps.state === PlayingState.Playing) {
        this.ps.cancel();
      }

      switch (this.rs.state) {
        case RecordingState.Paused:
          this.rs.start();
          break;
        case RecordingState.Recording:

          // this.audioAsBlob = await this.rs.getData();
          // this.ls.log('Blob received size ' + this.audioAsBlob.size, this.moduleName, functionName, 1);
          this.rs.getData().then((data) => {
            this.audioAsBlob = data;
          });
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
    let functionName = 'monitorStates';

    this.rs.stateChange.subscribe((state: RecordingState) => {
      this.ls.log('rs.stateChange to ' + state, this.moduleName, functionName, 1);
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
      this.ls.log('ps.stateChange to ' + state, this.moduleName, functionName, 1);
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
  recordClick() {
    let functionName = 'recordClick';
    this.ls.log('Called.', this.moduleName, functionName, 1);
    this.toggleRecord();
  }
  recordMousedown() {
    let functionName = 'recordMousedown';
    this.ls.log('Called.', this.moduleName, functionName, 1);
    // this.toggleRecord();
  }
  recordDrag() {
    let functionName = 'recordDrag';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    // this.toggleRecord();
  }
  recordDblClick() {
    let functionName = 'recordDblClick';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    // this.toggleRecord();
  }
  recordTouchmove() {
    let functionName = 'recordTouchmove';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    // this.toggleRecord();
  }
  recordTouchstart() {
    let functionName = 'recordTouchstart';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    // this.toggleRecord();
  }

  playClick() {
    let functionName = 'playClick';
    this.ls.log('Called.', this.moduleName, functionName, 1);
    this.togglePlay();
  }
  playMousedown() {
    let functionName = 'playMousedown';
    this.ls.log('Called.', this.moduleName, functionName, 1);
    // this.togglePlay();
  }
  playDrag() {
    let functionName = 'playDrag';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    // this.togglePlay();
  }
  playDblClick() {
    let functionName = 'playDblClick';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    // this.togglePlay();
  }
  playTouchmove() {
    let functionName = 'playTouchmove';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    // this.togglePlay();
  }
  playTouchstart() {
    let functionName = 'playTouchstart';
    this.ls.log('Initial', this.moduleName, functionName, 1);
    // this.togglePlay();
  }

}

/*
 (drag)="recordDrag()"
    (dblclick)="recordDblClick()"
    (touchmove)="recordTouchmove()"
    (touchstart)="recordTouchstart()"
    (mousedown)="recordMousedown()"

    (drag)="playDrag()"
    (dblclick)="playDblClick()"
    (touchmove)="playTouchmove()"
    (touchstart)="playTouchstart()"
    (mousedown)="playMousedown()"

*/


