import { Component, OnInit } from '@angular/core';
import { PlaybackService, PlayingState } from 'src/app/services/playback.service';
import { RecordingService, RecordingState } from 'src/app/services/recording.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

  messages = new Array<string>();

  constructor(private ps: PlaybackService, private rs: RecordingService) {

  }

  ngOnInit(): void {

    if (this.ps.state === PlayingState.Ready) {
      this.messages.push("PlayingState is Ready. Getting info...");
    }

    if (this.rs.state !== RecordingState.UnInitialized) {
      this.messages.push("RecordingState is " + this.rs.state + ". Getting info...");
      this.messages.push("MimeType: " + this.rs.getMimeType() );

    }



  }



}
