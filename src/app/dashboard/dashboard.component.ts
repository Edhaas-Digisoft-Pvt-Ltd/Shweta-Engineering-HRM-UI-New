import { EmployeeActionComponent } from '../employee/employee-action/employee-action.component';
import { ColDef } from 'ag-grid-community';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { Component, OnInit } from '@angular/core';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { Router } from '@angular/router';

// For attendance chart
Chart.register(DataLabelsPlugin);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  financialYears: string[] = [];
  selectedYear: string = '';
  selectedCompany: string = 'Company A'; // default selection
  leaveCards = [
    {
      title: 'Total Leave Request',
      count: 50,
      icon: 'bi bi-calendar-event',
      bgColor: '#3674B5'
    },
    {
      title: 'Approved Leaves',
      count: 20,
      icon: 'bi bi-calendar2-check',
      bgColor: '#006D42'
    },
    {
      title: 'Pending Leaves',
      count: 25,
      icon: 'bi bi-calendar2-week',
      bgColor: '#C8B100'
    },
    {
      title: 'Reject Leaves',
      count: 5,
      icon: 'bi bi-calendar-x',
      bgColor: '#880021'
    },
  ];
  optionsArray: string[] = ['Company A', 'Company B', 'Company C'];
  selectedValue: string = 'Company A'; // Default selected
  searchValue: string = '';
  gridApiActive: any;


  constructor(private router: Router) {
    this.loadChartData();
  }

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 4; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 1;
      this.financialYears.push(`${startYear}-${endYear}`);
    }

    this.selectedYear = this.financialYears[0]; // default selected
  }


  selectCompany(companyName: string) {
    this.selectedCompany = companyName;
  }

  loadChartData() {
    // Labels for all 12 months
    const dynamicLabels = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Example dynamic values for each month (can be from API or calculation)
    const dynamicValues = [20, 45, 30, 80, 55, 60, 70, 65, 50, 75, 40, 90];

    // Assign to chart
    this.barChartData.labels = dynamicLabels;
    this.barChartData.datasets[0].data = dynamicValues;
  }

  leaveRequest() {
    this.router.navigate(['/authPanal/Leave']); // replace with your actual route
  }

  totalAttendance() {
    this.router.navigate(['/authPanal/Attendance']); // replace with your actual route
  }

  paymentStatistics() {
    this.router.navigate(['/authPanal/payrollList']); // replace with your actual route
  }

  viewEmployee() {
    this.router.navigate(['/authPanal/Employee']); // replace with your actual route
  }

  public defaultColDef: ColDef = {
    editable: true,
    flex: 1,
    resizable: true,
  };

  dashboardStats = [
    {
      icon: ' bi-buildings',
      title: 'Company A',
      value: 1500
    },
    {
      icon: ' bi-buildings',
      title: 'Company B',
      value: 4200
    },
    {
      icon: ' bi-buildings',
      title: 'Company C',
      value: 4200
    },
    {
      icon: ' bi-buildings',
      title: 'Company D',
      value: 4200
    },
    {
      icon: ' bi-buildings',
      title: 'Company E',
      value: 4200
    },

  ];

  statusButtonRenderer(params: any) {
    const status = params.value;
    const button = document.createElement('button');

    button.innerText = status;

    // Common styles
    button.style.padding = '6px 12px';
    button.style.borderRadius = '18px';
    button.style.cursor = 'default';
    button.style.height = '30px'; // ✅ Match AG Grid row height
    button.style.lineHeight = '20px';
    button.style.fontSize = '14px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.width = '100%';
    button.style.marginTop = '6px';


    // Conditional styling
    if (status === 'Inactive') {
      button.style.backgroundColor = '#f8d7da';  // light red
      button.style.color = '#721c24';           // dark red text
      button.style.border = '1px solid #f5c6cb';
    } else if (status === 'Active') {
      button.style.backgroundColor = '#B2FFE1B0'; // light green
      button.style.color = 'black';
      button.style.border = '1px solid #B2FFE1B0';
    }

    return button;
  }

  //  search in grid
  onGridReady(params: { api: any }) {
    this.gridApiActive = params.api;
  }
  onFilterBoxChange() {
    this.gridApiActive.setQuickFilter(this.searchValue);
  }
  emptyInput() {
    this.searchValue = '';
    window.location.reload();
  }
  // company selection
  onOptionSelected() {
    console.log('Selected option:', this.selectedValue);
  }

  // Chart for payroll statistics
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white'
        }
      },
      title: {
        display: false,
        text: 'Dynamic Bar Chart'
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'black' // Make labels on the X-axis red
        }
      },
      y: {
        ticks: {
          color: 'black', // tick label color
          callback: function (value: any) {
            return value.toLocaleString(); // formats 100000 as "100,000" for better readability
          }
        },
        title: {
          display: true,
          text: 'Amount (in Lakh ₹)',
          font: {
            size: 14
          },
          color: 'white'
        }
      }
    }
  };

  // Chart Data - DYNAMIC
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [], // Dynamic labels
    datasets: [
      {
        data: [],  // Dynamic values
        label: 'Values in Lakh',
        backgroundColor: '#3674B5',
        borderRadius: {
          topLeft: 10,
          topRight: 10,
          bottomLeft: 0,
          bottomRight: 0
        }
        ,
        datalabels: {
          display: false
        }
      }
    ]
  };

  // chart for the attendance system :
  public doughnutChartLabels: string[] = ['Present', 'Absent', 'Sick Leave', 'Casual Leave'];

  
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [
      {
        data: [300, 40, 20, 5],
        backgroundColor: ['#3A79D1', '#7C0A02', '#016A43', '#02DBA9'],
        hoverOffset: 10,
      }
    ]
  };

  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: {
            size: 12,
          }
        }
      },
      datalabels: {
        display: false
      }
    }
  };

}
