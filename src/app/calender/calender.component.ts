import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css']
})
export class CalenderComponent implements OnInit {
  // Array to hold all events
  dateEvents = [
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


  calendarOptions: any = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: this.handleDateClick.bind(this),
    events: [] as any[]
  };

  ngOnInit(): void {
    // Load initial events into calendar from dateEvents
    this.calendarOptions.events = [...this.dateEvents];
  }

  handleDateClick(arg: any) {
    const selectedDate = arg.dateStr;
    const task = prompt(`Add a task for ${selectedDate}`);
    // const dis = prompt(`Add a task for ${selectedDate}`);
    if (task) {
      const newEvent = {
        title: task,
        date: selectedDate
      };

      // Add to both calendar and dateEvents array
      this.dateEvents.push(newEvent);
      this.calendarOptions.events = [...this.dateEvents]; // Refresh the calendar
    }
  }
}
