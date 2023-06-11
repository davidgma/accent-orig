import { Injectable } from '@angular/core';

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
    this.audioBlobs = [];

    

    //start the recording by calling the start method on the media recorder
    this.mediaRecorder.start();
    console.log("mediaRecorder state: " + this.mediaRecorder.state);


    /* errors are not handled in the API because if its handled and the promise is chained, the .then after the catch will be executed*/

  }



  /** Cancel audio recording*/
  async cancel() {

    this.audioBlobs = new Array();

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
}
