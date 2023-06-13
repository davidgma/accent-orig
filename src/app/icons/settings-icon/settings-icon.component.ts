import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-settings-icon',
  templateUrl: './settings-icon.component.html',
  styleUrls: ['./settings-icon.component.scss']
})
export class SettingsIconComponent {
  @Input() iconSize = 10;
  @Input() strokeColour = "white";
  @Input() fillColour = "grey";
  @Input() selected = false;
  @Input() text: string | null = "Settings";
}
