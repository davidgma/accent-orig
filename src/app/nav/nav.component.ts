import { Component } from '@angular/core';
import { EventType, Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  defaultColour = "black";
  selectedColour = "red";

  constructor() {
  }


}
