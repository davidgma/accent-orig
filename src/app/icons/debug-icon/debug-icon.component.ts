import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-debug-icon',
  templateUrl: './debug-icon.component.html',
  styleUrls: ['./debug-icon.component.scss']
})
export class DebugIconComponent {
  @Input() iconSize = 10;
  @Input() strokeColour = "white";
  @Input() fillColour = "grey";
  @Input() selected = false;
  @Input() text: string | null = "Debug";
}
