import { Component } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-attendance-data',
  templateUrl: './attendance-data.component.html',
  styleUrls: ['./attendance-data.component.css']
})
export class AttendanceDataComponent {
chartType: ChartType = 'doughnut';

  // Define Chart Options
  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' } // Position of legend
    }
  };

  // Define Chart Data
  chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'], // X-axis labels
    datasets: [
      {
        label: 'Sales 2022',
        data: [40, 30, 25, 40], // Y-axis data values
        backgroundColor: 'rgba(54, 162, 235, 0.5)', // Light blue fill color
        borderColor: 'rgb(54, 162, 235)', // Border color
        borderWidth: 1
      }
    ]
  };

  
}
