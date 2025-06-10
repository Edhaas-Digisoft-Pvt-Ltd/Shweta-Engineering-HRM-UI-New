import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bonus-and-incentive',
  templateUrl: './bonus-and-incentive.component.html',
  styleUrls: ['./bonus-and-incentive.component.css']
})
export class BonusAndIncentiveComponent implements OnInit {
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

 activeTab: string = 'tab1';

  selectTab(tab: string) {
    this.activeTab = tab;
  }

}
