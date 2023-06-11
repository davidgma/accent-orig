import { Component } from '@angular/core';
import { AudioRecorderService } from 'src/app/services/audio-recorder.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  private audioAsBlob = new Blob();
  // audioElement?: HTMLAudioElement;
  // audioElementSource?: HTMLSourceElement;


  constructor(private audioRecorder: AudioRecorderService) {}

  status: Status = Status.Idle;

  ngOnInit() {
    window.addEventListener("focus", () => {
      console.log("Window gained focus");
      this.gainedFocus();
    });
    window.addEventListener("pageshow", () => {
      console.log("Window pageshow");
      this.gainedFocus();
    });
    window.addEventListener("blur", () => {
      console.log("Window lost focus");
      this.lostFocus();
    });
    window.addEventListener("pagehide", () => {
      console.log("Window pagehide");
      this.lostFocus();
    });
    document.onvisibilitychange = () => {
      if (document.visibilityState === "hidden") {
        console.log("Document hidden");
        this.lostFocus();
      }
      if (document.visibilityState === "visible") {
        console.log("Document visible");
        this.gainedFocus();
      }
    }

    this.audioRecorder.recordingReady.subscribe((blob) => {
      this.audioAsBlob = blob;
    });

    // this.audioElement = <HTMLAudioElement>document.getElementsByClassName("audio-element")[0];
    // if (this.audioElement.getElementsByTagName("source")[0] === null) {
    //   this.audioElementSource = this.createSourceForAudioElement();
    // }
    // else {
    //   this.audioElementSource = this.audioElement.getElementsByTagName("source")[0];
    // }

  }

  async lostFocus() {

    if (this.status === Status.Idle) {
      console.log("Already idle");
      return;
    }

    this.status = Status.Idle;
    await this.cancelRecording();

  }

  async gainedFocus() {

    if (this.status === Status.Monitoring) {
      console.log("Already monitoring");
      return;
    }

    this.status = Status.Monitoring;
    await this.startMonitoring();
    this.audioRecorder.pause();
  }

  async play() {


    console.log("play");

    if (this.status === Status.Recording) {
      console.log("playing from recorded...");
      await this.stopRecording();
      // wait for the new recording to be ready
      this.audioRecorder.recordingReady.subscribe((blob) => {
        this.audioRecorder.playBlob(blob).then(() => {

          console.log("Finished playing audio");
        });
      });


      // temp:
      //
      // this.refresh();
    }

    else if (this.audioAsBlob.size === 0) {
      return;
    }

    else if (this.status === Status.Playing) {
      this.status = Status.Monitoring;
      this.stopPlaying();
    }
    else {
      this.status = Status.Playing;
      this.refresh();
      await this.startPlaying();
      this.status = Status.Monitoring;
      console.log("Finished playing audio");
    }

  }


  async record() {
    console.log("record");

    switch (this.status) {
      case Status.Idle:
        console.log("Error: shouldn't have been idle.");
        break;
      case Status.Monitoring:
        this.status = Status.Recording;
        await this.startRecording();
        break;
      case Status.Playing:
        this.stopPlaying();
        // this.startMonitoring();
        this.startRecording();
        break;
      case Status.Recording:
        this.status = Status.Monitoring;
        await this.stopRecording();
        // temp:
        this.refresh();
    }

  }

  async refresh() {
    await this.cancelRecording();
    await this.startMonitoring();
    this.audioRecorder.audioBlobs = new Array<Blob>();
    this.audioRecorder.pause();
  }

  async startMonitoring() {

    console.log("startMonitoring");

    await this.audioRecorder.ready;

    // Check the recorder is active
    if (this.audioRecorder.mediaRecorder.stream.active === false) {
      console.log("in startMonitoring: stream is inactive");
      this.audioRecorder.ready = this.audioRecorder.setupRecorder();
      await this.audioRecorder.ready;
    }

    console.log("Stream active: " + this.audioRecorder.mediaRecorder.stream.active);

    await this.audioRecorder.start()
      .then(() => { //on success

        //store the recording start time to display the elapsed time according to it
        this.audioRecordStartTime = new Date();

      })
      .catch((error: { message: string | string[]; name: string; }) => { //on error
        //No Browser Support Error
        if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {
          console.log("To record audio, use browsers like Chrome and Firefox.");
        }

        //Error handling structure
        switch (error.name) {
          case 'AbortError': //error from navigator.mediaDevices.getUserMedia
            console.log("An AbortError has occurred.");
            break;
          case 'NotAllowedError': //error from navigator.mediaDevices.getUserMedia
            console.log("A NotAllowedError has occurred. User might have denied permission.");
            break;
          case 'NotFoundError': //error from navigator.mediaDevices.getUserMedia
            console.log("A NotFoundError has occurred.");
            break;
          case 'NotReadableError': //error from navigator.mediaDevices.getUserMedia
            console.log("A NotReadableError has occurred.");
            break;
          case 'SecurityError': //error from navigator.mediaDevices.getUserMedia or from the MediaRecorder.start
            console.log("A SecurityError has occurred.");
            break;
          case 'TypeError': //error from navigator.mediaDevices.getUserMedia
            console.log("A TypeError has occurred.");
            break;
          case 'InvalidStateError': //error from the MediaRecorder.start
            console.log("An InvalidStateError has occurred.");
            break;
          case 'UnknownError': //error from the MediaRecorder.start
            console.log("An UnknownError has occurred.");
            break;
          default:
            console.log("An error occurred with the error name " + error.name);
        };
      });

    console.log("number of blobs: " + this.audioRecorder.audioBlobs.length);


  }


  private async startRecording() {
    console.log("startRecording");

    // Discard any previous recording from the monitoring
    // this.audioRecorder.audioBlobs = new Array<Blob>();

    // this.audioRecorder.mediaRecorder.requestData();
    this.audioRecorder.unPause();
  }

  private async cancelRecording() {


    console.log("Cancelling recording...");
    //stop the recording using the audio recording API
    await this.audioRecorder.cancel();
    // console.log("Cancelled.");

  }

  private async saveRecording() {
    console.log("in saveRecording");
    this.audioRecorder.mediaRecorder.requestData();
  }

  private async stopRecording() {
    console.log("stopRecording");
    // Get the latest blob
    //save audio type to pass to set the Blob type
    if (this.audioRecorder.mediaRecorder !== null) {

      this.audioRecorder.pause();
      this.audioRecorder.mediaRecorder.requestData();
    }

  }


  private async startPlaying() {
    await this.audioRecorder.playBlob(this.audioAsBlob);

  }

  private stopPlaying() {
    console.log("stopPlaying");
    // this.audioRecorder.
    let audioElement = <HTMLAudioElement>document.getElementsByClassName("audio-element")[0];
    if (audioElement != null) {
      audioElement.pause();
    }
  }

  /** Stores the actual start time when an audio recording begins to take place to ensure elapsed time start time is accurate*/
  private audioRecordStartTime = new Date();

  /** Stores the maximum recording time in hours to stop recording once maximum recording hour has been reached */
  private maximumRecordingTimeInHours = 1;

  /** Stores the reference of the setInterval function that controls the timer in audio recording*/
  private elapsedTimeTimer: any = null;


  /* Creates a source element for the the audio element in the HTML document*/
  private createSourceForAudioElement(): HTMLSourceElement {

    let sourceElement = document.createElement("source");
    // console.log("sourceElement: " + JSON.stringify(sourceElement));

    let audioElement = <HTMLAudioElement>document.getElementsByClassName("audio-element")[0];
    // console.log("audioElement: " + JSON.stringify(audioElement));
    audioElement.appendChild(sourceElement);
    return sourceElement;

    // this.audioElementSource = sourceElement;
  }

}

enum Status {
  Idle = "Idle",
  Monitoring = "Monitoring",
  Recording = "Recording",
  Saving = "Saving",
  Playing = "Playing"
}
