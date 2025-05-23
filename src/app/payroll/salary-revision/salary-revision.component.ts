import { Component } from '@angular/core';

@Component({
  selector: 'app-salary-revision',
  templateUrl: './salary-revision.component.html',
  styleUrls: ['./salary-revision.component.css']
})
export class SalaryRevisionComponent {
  employees = [
    {
      name:"Hrishikesh kadam"
    },
    {
      name:"Tanuja Hakepatil"
    },
    {
      name:"Renuka Thakur"
    },
    {
      name:"Sonal Patil"
    },
  ]
  companies = [
    {
      name:"Company A"
    },
    {
      name:"Company B"
    },
    {
      name:"Company C"
    },
    {
      name:"Company D"
    },
  ]
}
