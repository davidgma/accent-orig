import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-icon',
  templateUrl: './info-icon.component.html',
  styleUrls: ['./info-icon.component.scss']
})
export class InfoIconComponent {
  @Input() iconSize = 10;
  @Input() strokeColour = "white";
  @Input() fillColour = "grey";
  @Input() selected = false;
  @Input() text: string | null = "Info";
}
