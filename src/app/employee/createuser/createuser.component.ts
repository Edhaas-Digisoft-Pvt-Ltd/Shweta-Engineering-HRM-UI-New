import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-createuser',
  templateUrl: './createuser.component.html',
  styleUrls: ['./createuser.component.css']
})
export class CreateuserComponent {

  activeTab: string = 'tab1';
  @Input() ctc: number = 0;
  
  selectTab(tab: string) {
    this.activeTab = tab;
  }
  @Input() statutoryInfo: string[] = [];

  @Output() salaryAmountChange = new EventEmitter<number>();
  @Output() ctcChange = new EventEmitter<number>();

  // ctc: number = 0;
  value: number = 0;
  amount: number = 0; // Store multiplied value
  pf: number = 0;
  pt: number = 0;
  esi: number = 0;
  epf: number = 0;
  eesi: number = 0;
  ruleAmount = 0;
  salaryAmount = 0;

  ngOnInit() {
    // console.log('Received CTC:', this.ctc);
    this.ctcChange.emit(this.ctc); // Send to parent
    // console.log('Statutory Info from parent:', this.statutoryInfo);
  }
  

  calculateAmount() {
    this.amount = this.ctc / 12;
    this.ruleAmount = this.pf + this.pt + this.esi + this.epf + this.eesi;
    this.salaryAmount = this.amount - this.ruleAmount;
  
    // console.log('Calculated salaryAmount:', this.salaryAmount);
  
    // Emit the result to parent
    this.salaryAmountChange.emit(this.salaryAmount);
    this.ctcChange.emit(this.ctc);

  }

  sendCTCToParent() {
    this.ctcChange.emit(this.ctc);
  }
  
}
