import { Component, Input, SimpleChanges } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent extends IconComponent {
  // @Input() centralIcon = true;

  // ngOnChanges(changes: SimpleChanges) {
  //   for (let variableName in changes) {
  //     let change = changes[variableName];
  //     if (variableName === "centralIcon") {
  //       if (this.centralIcon === true) {
  //         console.log("this.centralIcon: " + this.centralIcon);
  //         // this.iconSize = 20;
  //       }
  //       else {
  //         console.log("this.centralIcon: " + this.centralIcon);
  //       }

  //     }
  //   }
  // }
}
