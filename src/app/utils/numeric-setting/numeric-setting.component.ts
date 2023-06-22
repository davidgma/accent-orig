import { Component, Input } from '@angular/core';
import { Setting } from 'src/app/services/settings.service';

@Component({
  selector: 'app-numeric-setting',
  templateUrl: './numeric-setting.component.html',
  styleUrls: ['./numeric-setting.component.scss']
})
export class NumericSettingComponent {
  @Input() setting = new Setting<number>("initial", "initial", 1);

  valueChanged() {

    let valueElement = <HTMLParagraphElement>document.getElementById("value");
    if (valueElement !== null) {
      if (valueElement.textContent !== null) {
        let value = Number.parseInt(valueElement.textContent);

        if (!Number.isNaN(value)) {
          this.setting.value = Number.parseInt(valueElement.textContent);
        }
      }
    }

  }

  increment() {
    this.setting.value++;
  }

  decrement() {
    this.setting.value--;
  }
}
