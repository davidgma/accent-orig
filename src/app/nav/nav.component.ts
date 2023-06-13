import { Component } from '@angular/core';
import { EventType, Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  private defaultStroke = "black";
  private defaultFill = "black";
  private selectedStroke = "red";
  private selectedFill = "red";
  strokeHome: string;
  fillHome: string;
  strokeInfo: string;
  fillInfo: string;
  strokeSettings: string;
  fillSettings: string;
  strokeDebug: string;
  fillDebug: string;


  constructor(private router: Router) {
    this.strokeHome = this.defaultStroke;
    this.fillHome = this.defaultFill;
    this.strokeInfo = this.defaultStroke;
    this.fillInfo = this.defaultFill;
    this.strokeSettings = this.defaultStroke;
    this.fillSettings = this.defaultFill;
    this.strokeDebug = this.defaultStroke;
    this.fillDebug = this.defaultFill;
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event.type === EventType.NavigationStart) {
        switch (this.router.url) {
          case "/":
            break;
          case "/home":
            this.strokeHome = this.defaultStroke;
            this.fillHome = this.defaultFill;
            break;
          case "/info":
            this.strokeInfo = this.defaultStroke;
            this.fillInfo = this.defaultFill;
            break;
          case "/settings":
            this.strokeSettings = this.defaultStroke;
            this.fillSettings = this.defaultFill;
            break;
          case "/debug":
            this.strokeDebug = this.defaultStroke;
            this.fillDebug = this.defaultFill;
            break;
        }
      }
      if (event.type === EventType.NavigationEnd) {
        switch (this.router.url) {
          case "/":
            break;
          case "/home":
            this.strokeHome = this.selectedStroke;
            this.fillHome = this.selectedFill;
            break;
          case "/info":
            this.strokeInfo = this.selectedStroke;
            this.fillInfo = this.selectedFill;
            break;
          case "/settings":
            this.strokeSettings = this.selectedStroke;
            this.fillSettings = this.selectedFill;
            break;
          case "/debug":
            this.strokeDebug = this.selectedStroke;
            this.fillDebug = this.selectedFill;
            break;
        }
      }

    });
  }


}
