import { Component } from '@angular/core';

@Component({
  selector: 'app-newcalender',
  templateUrl: './newcalender.component.html',
  styleUrls: ['./newcalender.component.css']
})
export class NewcalenderComponent {
  currentDate: Date = new Date();
  dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames: string[] = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  days: any[] = [];

  events: { date: string, tasks: string[] }[] = [];

  ngOnInit() {
    const storedEvents = localStorage.getItem('calendarTasks');
    if (storedEvents) {
      this.events = JSON.parse(storedEvents);
    }
    this.generateCalendar();
  }
  
  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    this.days = [];

    for (let i = 0; i < firstDay; i++) {
      this.days.push({ date: '', fullDate: '', tasks: [] });
    }

    for (let day = 1; day <= totalDays; day++) {
      const fullDate = `${year}-${month + 1}-${day}`;
      const stored = this.events.find(ev => ev.date === fullDate);
      this.days.push({
        date: day,
        fullDate: fullDate,
        tasks: stored ? stored.tasks : []
      });
    }
  }

  addTask(dateStr: string) {
    const task = prompt(`Add a task for ${dateStr}`);
    if (task) {
      let event = this.events.find(ev => ev.date === dateStr);
      if (event) {
        event.tasks.push(task);
      } else {
        this.events.push({ date: dateStr, tasks: [task] });
      }

      // ✅ Save to localStorage
      localStorage.setItem('calendarTasks', JSON.stringify(this.events));

      this.generateCalendar();
    }
  }


  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }
}
