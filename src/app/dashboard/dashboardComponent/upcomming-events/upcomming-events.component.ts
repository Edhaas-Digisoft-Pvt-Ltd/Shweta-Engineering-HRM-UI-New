import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upcomming-events',
  templateUrl: './upcomming-events.component.html',
  styleUrls: ['./upcomming-events.component.css']
})
export class UpcommingEventsComponent {


  constructor(private router: Router) {}

  // event list 
  dateEvents = [
    {
      title: "Client Call",
      date: "2025-04-25"
    },
    {
      title: "Client Call",
      date: "2025-04-17"
    },
    {
      title: "Client Call",
      date: "2025-04-08"
    },
    {
      title: "Team Meeting",
      date: "2025-04-09"
    },
    {
      title: "api integration",
      date: "2025-04-12"
    },
    {
      title: "Client Call",
      date: "2025-04-14"
    },
    {
      title: "Client Call",
      date: "2025-04-17"
    }
  ];

  viewCalender()
  {
    this.router.navigate(['authPanal/Calender']);
  }
}
