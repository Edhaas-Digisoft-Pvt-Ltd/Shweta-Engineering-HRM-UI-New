import { Component } from '@angular/core';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent {

  activeTab: string = 'tab1';

  selectTab(tab: string) {
    this.activeTab = tab;
  }
}
