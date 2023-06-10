import { Component } from '@angular/core';
import { AudioRecorderService } from 'src/app/services/audio-recorder.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  private audioAsBlob = new Blob();

  constructor(private audioRecorder: AudioRecorderService) { }

  status = "Not started"
  isRecording = false;
  isPlaying = false;

  async play() {
    if (this.status === "Not started") {
      return;
    }

    console.log("play");

    if (this.isRecording) {
      await this.stopRecording();
    }

    if (this.isPlaying) {
      this.stopPlaying();
    }
    else {
      await this.startPlaying();
      console.log("Finished playing audio");
      this.isPlaying = false;
      this.status = "Ready"
    }



  }

  async record() {
    console.log("record");

    if (this.isPlaying) {
      this.stopPlaying();
    }

    if (this.isRecording) {
      await this.stopRecording();
    }
    else {
      await this.startRecording();
    }
  }

  private async startRecording() {
    console.log("startRecording");
    this.status = "Recording";
    this.isRecording = true;
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
  }

  private async stopRecording() {
    console.log("stopRecording");
    //stop the recording using the audio recording API
    await this.audioRecorder.stop()
      .then(audioAsBlob => {
        this.audioAsBlob = audioAsBlob;
        //Play recorder audio
        //playAudio(audioAsBlob);

      })
      .catch(error => {
        //Error handling structure
        switch (error.name) {
          case 'InvalidStateError': //error from the MediaRecorder.stop
            console.log("An InvalidStateError has occurred.");
            break;
          default:
            console.log("An error occurred with the error name " + error.name);
        };
      });
    this.status = "Ready";
    this.isRecording = false;

  }

  private async startPlaying() {
    return new Promise<void>((resolve, reject) => {
      console.log("startPlaying");
      this.status = "Playing";
      this.isPlaying = true;
      let audioElement = <HTMLAudioElement>document.getElementsByClassName("audio-element")[0];
      if (audioElement == null) {
        console.log("Error in startPlaying: audioElement is null");
        reject();
      }
      let audioElementSource = audioElement.getElementsByTagName("source")[0];
      if (audioElementSource == null) {
        audioElementSource = this.createSourceForAudioElement();
      }

      //read content of files (Blobs) asynchronously
      let reader = new FileReader();

      //once content has been read
      reader.onload = (e) => {
        //store the base64 URL that represents the URL of the recording audio
        if (e.target == null) {
          console.log("From startPlaying: Error: e.target is null");
          reject();
        }
        else {
          let base64URL = e.target.result;
          //If this is the first audio playing, create a source element
          //as pre populating the HTML with a source of empty src causes error
          // if (!this.audioElementSource) //if its not defined create it (happens first time only)

          //set the audio element's source using the base64 URL
          if (base64URL == null) {
            console.log("From startPlaying: Error: base64URL is null");
            reject();
            return;
          }

          audioElementSource.src = base64URL.toString();

          //set the type of the audio element based on the recorded audio's Blob type
          let BlobType = this.audioAsBlob.type.includes(";") ?
            this.audioAsBlob.type.substr(0, this.audioAsBlob.type.indexOf(';')) : this.audioAsBlob.type;
          audioElementSource.type = BlobType

          //call the load method as it is used to update the audio element after changing the source or other settings
          audioElement.load();

          //play the audio after successfully setting new src and type that corresponds to the recorded audio
          console.log("Playing audio...");
          if (audioElement != null) {
            audioElement.play().then(() => {
              audioElement?.addEventListener("ended", () => {
                // console.log("complete event");
                resolve();
              });
            });
          }

        };

      }

      //read content and convert it to a URL (base64)
      reader.readAsDataURL(this.audioAsBlob);

    });
  }

  private stopPlaying() {
    console.log("stopPlaying");
    let audioElement = <HTMLAudioElement>document.getElementsByClassName("audio-element")[0];
    if (audioElement != null) {
      audioElement.pause();
    }
    this.status = "Ready";
    this.isPlaying = false;
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
