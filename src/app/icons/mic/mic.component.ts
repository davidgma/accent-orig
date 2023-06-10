import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mic',
  templateUrl: './mic.component.html',
  styleUrls: ['./mic.component.scss']
})
export class MicComponent {
  @Input() iconSize = 10;
  @Input() strokeColour = "white";
  @Input() fillColour = "grey";
  @Input() selected = false;
  @Input() text: string | null = "Record";
}
