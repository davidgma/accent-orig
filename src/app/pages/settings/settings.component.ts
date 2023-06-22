import { Component } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  constructor(public ss: SettingsService) { }

  isBoolean(value: any): boolean { return (typeof value === "boolean") }

  isNumeric(value: any): boolean { return (typeof value === "number") }
}
