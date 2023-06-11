import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioRecorderService {

  /** Stores the recorded audio as Blob objects of audio data as the recording continues*/
  audioBlobs = new Array<Blob>(); /*of type Blob[]*/

  /** Stores the reference of the MediaRecorder instance that handles the MediaStream when recording starts*/
  mediaRecorder: MediaRecorder; /*of type MediaRecorder*/

  /** Stores the reference to the stream currently capturing the audio*/
  streamBeingCaptured: MediaStream = new MediaStream(); /*of type MediaStream*/

  ready: Promise<void>;

  recordingReady = new EventEmitter<Blob>();



  constructor() {
    // This is just a dummy MediaRecorder to satisfy the typing checks:
    this.mediaRecorder = new MediaRecorder(new MediaStream());

    // Actually set up the mediaRecorder and streamBeingCaptured
    this.ready = this.setupRecorder();
  }

  async setupRecorder() {
    // console.log("streamBeingCaptured before: ");
    // console.log("stream active: " + this.streamBeingCaptured.active);
    await this.createStream();
    // console.log("streamBeingCaptured after: ");
    // console.log("stream active: " + this.streamBeingCaptured.active);

    // console.log("mediaRecorder before:");
    // console.log(this.mediaRecorder.stream.active);
    await this.createMediaRecorder();
    // console.log("mediaRecorder after:");
    // console.log(this.mediaRecorder.stream.active);

  }

  async createStream() {
    //Feature Detection
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      //Feature is not supported in browser
      //return a custom error
      console.log("Error: mediaDevices API or getUserMedia method is not supported in this browser.");
    }
    //Feature is supported in browser
    this.streamBeingCaptured =
      await navigator.mediaDevices.getUserMedia({ audio: true });
  }

  async createMediaRecorder() {
    //create a media recorder instance by passing that stream into the MediaRecorder constructor
    this.mediaRecorder = new MediaRecorder(this.streamBeingCaptured);
    /*the MediaRecorder interface of the MediaStream Recording
    API provides functionality to easily record media*/
  }

  /* Start recording the audio
     * @returns {Promise} - returns a promise that resolves if audio recording successfully started
     */
  async start() {

    console.log("audio-recorder start called");
    console.log("this.mediaRecorder active: "
      + this.mediaRecorder.stream.active);


    //clear previously saved audio Blobs, if any
    // this.audioBlobs = [];

    //add a dataavailable event listener in order to store the audio data Blobs when recording
    this.mediaRecorder.addEventListener("dataavailable", event => {
      //store audio Blob object
      let blob: Blob = event.data;
      console.log("blob gathered size: " + blob.size);

      if (blob.size > 0) {
        this.audioBlobs.push(blob);
        // if (this.audioBlobs.length === 1) {
        for (let b of this.audioBlobs) {
          console.log("blob sizes: " + b.size);
        }
        let mimeType = this.mediaRecorder.mimeType;
        // console.log("mimType:" + mimeType);
        let combined = new Blob(this.audioBlobs, { type: mimeType });
        console.log("total size: " + combined.size);

        // this.playBlob(combined);
        this.recordingReady.emit(combined);
        // }
      }
    });

    //start the recording by calling the start method on the media recorder
    // console.log("mediaRecorder state: " + this.mediaRecorder.state);
    if (this.mediaRecorder.state !== "recording") {
      this.mediaRecorder.start();

    }


    /* errors are not handled in the API because if its handled and the promise is chained, the .then after the catch will be executed*/

  }



  /** Cancel audio recording*/
  async cancel() {

    // zx
    // this.audioBlobs = new Array();

    //stop the recording feature
    this.mediaRecorder.stop();

    //stop all the tracks on the active stream in order to stop the stream
    this.stopStream();

    //reset API properties for next recording
    this.resetRecordingProperties();

    // this.mediaRecorder = new MediaRecorder(new MediaStream());

  }

  /* Stop all the tracks on the active stream in order to stop the stream and remove
  * the red flashing dot showing in the tab
  */
  stopStream() {

    //stopping the capturing request by stopping all the tracks on the active stream
    this.streamBeingCaptured.getTracks() //get all tracks from the stream
      .forEach(track /*of type MediaStreamTrack*/ => track.stop()); //stop each one
  }

  /* Reset all the recording properties including the media recorder and stream being captured*/
  resetRecordingProperties() {

    // this.mediaRecorder = new MediaRecorder(new MediaStream());

    /*No need to remove event listeners attached to mediaRecorder as
    If a DOM element which is removed is reference-free (no references pointing to it), the element itself is picked
    up by the garbage collector as well as any event handlers/listeners associated with it.
    getEventListeners(audioRecorder.mediaRecorder) will return an empty array of events.*/
  }

  pause() {
    this.mediaRecorder.pause();
  }

  unPause() {
    this.mediaRecorder.resume();
  }

  async playBlob(blob: Blob): Promise<void> {
    let p = new Promise<void>((resolve, reject) => {

      console.log("playBlob");

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
          return;
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
          let BlobType = blob.type.includes(";") ?
            blob.type.substr(0, blob.type.indexOf(';')) : blob.type;
          audioElementSource.type = BlobType

          //call the load method as it is used to update the audio element after changing the source or other settings
          audioElement.load();

          //play the audio after successfully setting new src and type that corresponds to the recorded audio
          if (audioElement != null) {
            console.log("Playing blob audio...");
            // audioElement.currentTime = 3;
            audioElement.play().then(() => {
              audioElement?.addEventListener("ended", () => {
                // console.log("Finished playing audio");
                resolve();
              });
            });
          }

        };

      }
      //read content and convert it to a URL (base64)
      reader.readAsDataURL(blob);
    });
    return p;

  }

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
