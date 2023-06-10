import { Component } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  play() {
    console.log("play");

  }

  record() {
    console.log("record");

  }
}
