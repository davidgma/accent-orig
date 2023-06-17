import { EventEmitter, Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class PlaybackService {
  private moduleName = 'PlaybackService';

  stateChange = new EventEmitter<PlayingState>();
  state = PlayingState.UnInitialized;
  private audio: HTMLAudioElement | null = null;
  private source: HTMLSourceElement | null = null;

  constructor(private ls: LoggerService) {

  }

  public setupAudio() {
    let functionName = 'setupAudio';

    if (this.state !== PlayingState.UnInitialized) {
      this.ls.log('Audio already set up - nothing more to initialize.', this.moduleName, functionName, 1);
    }
    else {
      this.audio = <HTMLAudioElement>document.getElementsByClassName("audio-element")[0];
      if (this.audio === null) {
        this.ls.log('Error in startPlaying: audioElement is null',
          this.moduleName, functionName);
        return;
      }
      this.source = this.audio.getElementsByTagName("source")[0];
      if (this.source == null) {
        this.source = this.createSourceForAudioElement();
      }

      // this.audio.autoplay = true;

      this.state = PlayingState.Ready;
      this.stateChange.emit(this.state);

      this.monitorAudio(this.audio);
    }

  }

  async play(blob: Blob, currentTime = 0): Promise<void> {
    let functionName = 'play';
    this.ls.log('Called. blob size: ' + blob.size, this.moduleName, functionName, 1);

    this.state = PlayingState.Playing;
    this.stateChange.emit(this.state);

    return new Promise<void>(async (resolve, reject) => {
      this.ls.log('playBlob', this.moduleName, functionName);

      //read content of files (Blobs) asynchronously
      let reader = new FileReader();

      //once content has been read
      reader.onload = async (e) => {
        this.ls.log('Reader loaded', this.moduleName, functionName, 1);

        //store the base64 URL that represents the URL of the recording audio
        if (e.target == null) {
          this.ls.log('From startPlaying: Error: e.target is null', this.moduleName, functionName);
          reject();
          return;
        }
        else {
          let base64URL = e.target.result;
          //If this is the first audio playing, create a source element
          //as pre populating the HTML with a source of empty src causes error
          // if (!this.audioElementSource) //if its not defined create it (happens first time only)

          //set the audio element's source using the base64 URL
          if (base64URL == null) {
            this.ls.log('From startPlaying: Error: base64URL is null', this.moduleName, functionName);
            reject();
            return;
          }

          if (this.source !== null) {
            this.source.src = base64URL.toString();

            //set the type of the audio element based on the recorded audio's Blob type
            let BlobType = blob.type.includes(";") ?
              blob.type.substr(0, blob.type.indexOf(';')) : blob.type;
            this.source.type = BlobType

            if (this.audio !== null) {
              //call the load method as it is used to update the audio element after changing the source or other settings
              this.audio.load();
              //play the audio after successfully setting new src and type that corresponds to the recorded audio
              this.ls.log('Playing blob audio...', this.moduleName, functionName);
              this.ls.log('currentTime: ' + currentTime, this.moduleName, functionName, 1);
              this.audio.currentTime = currentTime;
              // this.audio?.addEventListener("ended", () => {
              //   this.ls.log('Finished playing audio.', this.moduleName, functionName, 1);
              //   this.state = PlayingState.Ready;
              //   this.stateChange.emit(this.state);
              //   resolve();
              // });
              // this.audio?.addEventListener("error", (event: Event) => {
              //   this.ls.log('Error playing audio: ' + event.type, this.moduleName, functionName, 1);
              // });
              // try {
              //   await this.audio.play();
              // }
              // catch (error) {
              //   this.ls.log('Error: ' + error, this.moduleName, functionName, 1);
              // }
              resolve();

            }
          }
        };

      }
      //read content and convert it to a URL (base64)
      reader.readAsDataURL(blob);
    });

  }

  /* Creates a source element for the the audio element in the HTML document*/
  private createSourceForAudioElement(): HTMLSourceElement {

    let sourceElement = document.createElement("source");
    // this.ls.log("sourceElement: " + JSON.stringify(sourceElement));

    let audioElement = <HTMLAudioElement>document.getElementsByClassName("audio-element")[0];
    // this.ls.log("audioElement: " + JSON.stringify(audioElement));
    audioElement.appendChild(sourceElement);
    return sourceElement;

    // this.audioElementSource = sourceElement;
  }

  // Cancel any currently playing audio.
  cancel() {
    let functionName = 'cancel';

    this.audio?.pause();
    this.state = PlayingState.Ready;
    this.stateChange.emit(this.state);
  }

  private monitorAudio(audio: HTMLAudioElement) {
    this.listen("abort", audio);
    this.listen("canplay", audio);
    this.listen("canplaythrough", audio);
    this.listen("durationchange", audio);
    this.listen("emptied", audio);
    this.listen("encrypted", audio);
    this.listen("ended", audio);
    this.listen("error", audio);
    this.listen("loadeddata", audio);
    this.listen("loadedmetadata", audio);
    this.listen("loadstart", audio);
    this.listen("pause", audio);
    this.listen("play", audio);
    this.listen("playing", audio);
    this.listen("progress", audio);
    this.listen("ratechange", audio);
    this.listen("seeked", audio);
    this.listen("seeking", audio);
    this.listen("stalled", audio);
    this.listen("suspend", audio);
    this.listen("timeupdate", audio);
    this.listen("volumechange", audio);
    this.listen("waiting", audio);
  }

  private listen(name: string, audio: HTMLAudioElement) {
    let functionName = 'listen';

    audio.addEventListener(name, async (event) => {
      this.ls.log(name + ' event emitted: '
        + JSON.stringify(event), this.moduleName, functionName, 1);
      if (event.type === "canplaythrough") {
        this.ls.log('Playing...', this.moduleName, functionName, 1);
        try {
          await audio.play();
        }
        catch (error) {
          this.ls.log('Error: ' + error, this.moduleName, functionName, 1);
        }
      }

      if (event.type === "ended") {
        this.ls.log('Finished playing audio.', this.moduleName, functionName, 1);
        this.state = PlayingState.Ready;
        this.stateChange.emit(this.state);
      }
    });
  }



}

export enum PlayingState {
  UnInitialized = "UnInitialized",
  Playing = "Playing",
  Ready = "Ready"
}
