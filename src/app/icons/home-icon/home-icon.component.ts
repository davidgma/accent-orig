import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-home-icon',
  templateUrl: './home-icon.component.html',
  styleUrls: ['./home-icon.component.scss']
})
export class HomeIconComponent {
  @Input() iconSize = 10;
  @Input() strokeColour = "white";
  @Input() fillColour = "grey";
  @Input() selected = false;
  @Input() text: string | null = "Home";
}
