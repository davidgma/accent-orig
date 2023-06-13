import { Component, Input, OnInit } from '@angular/core';
import { Router, EventType } from '@angular/router';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent implements OnInit {
  @Input() routeName = "";
  @Input() defaultColour = "green";
  @Input() selectedColour = "red";
  @Input() iconSize = 10;
  @Input() text: string | null = "SetMe";

  fillColour = "black";
  strokeColour = "darkslategray";

  constructor(private router: Router) {
  }


  ngOnInit(): void {

    // Set initial fill colour
    this.fillColour = this.defaultColour;

    // Listen for routing changes
    this.router.events.subscribe((event) => {

      if (event.type === EventType.NavigationStart) {
        if (this.router.url === this.routeName) {
          this.fillColour = this.defaultColour;
        }
      }

      if (event.type === EventType.NavigationEnd) {
        if (event.url === this.routeName) {
          this.fillColour = this.selectedColour;
        }
      }
    });

  }
}
