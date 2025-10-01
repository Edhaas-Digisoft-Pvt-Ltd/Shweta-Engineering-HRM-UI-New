import { EmployeeActionComponent } from '../employee/employee-action/employee-action.component';
import { ColDef } from 'ag-grid-community';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { Component, OnInit } from '@angular/core';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { Router } from '@angular/router';
import { HrmserviceService } from '../hrmservice.service';

// For attendance chart
Chart.register(DataLabelsPlugin);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  financialYears: any[] = [];
  selectedYear: any = '';
  selectedCompany: string = '';
  CompanyNames: any = [];
  selectedCompanyId: any;
  optionsArray: string[] = ['Company A', 'Company B', 'Company C'];
  selectedValue: string = 'Company A'; 
  searchValue: string = '';
  gridApiActive: any;
  leaveCards: any = [];
  totalAttendanceValue: number = 0;
  isLoading: boolean = false;
  totalEmployee: any = 0;
  lastMonthSalaryExpense: any = 0;
  pendingPayrollApprovals: any = 0;
  pendingLeaves: any = 0;

  constructor(private router: Router, private service: HrmserviceService) {
  }

  ngOnInit() {
    this.selectedCompanyId = this.service.selectedCompanyId();

    // const currentYear = new Date().getFullYear();
    // for (let i = 0; i < 4; i++) {
    //   const startYear = currentYear - i;
    //   const endYear = startYear + 1;
    //   this.financialYears.push(`${startYear}-${endYear}`);
    // }

    const currentYear = new Date().getFullYear();
    this.financialYears = [];

    for (let i = 3; i >= 0; i--) { 
      this.financialYears.push(currentYear - i);
    }


    // this.selectedYear = this.financialYears[0]; // default selected
    this.selectedYear = currentYear.toString(); // default selected
    this.getCompanyNames();

    if (sessionStorage.getItem('roleName') == 'admin') {
      this.router.navigate(['/authPanal/Dashboard']);
      return;
    } else {
      alert('Please Login To Proceed');
      sessionStorage.clear();
      this.router.navigate(['']);
      return;
    }
  }

  selectCompany(company: any) {
    this.selectedCompany = company.company_name;
    this.selectedCompanyId = company.company_id;
    this.service.setCompanyId(this.selectedCompanyId);

    this.payrollStatistics();
    this.loadLeaveCards();
    this.loadAttendanceSummary();
    this.getDashboardSummary();
  }

  onYearChange() {
    this.payrollStatistics();
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.CompanyNames = res.data;
        const defaultCompany = this.CompanyNames.find((comp: any) => comp.company_id === this.selectedCompanyId);
        if (defaultCompany) {
          this.selectCompany(defaultCompany);
        }
      }
    });
  }

  payrollStatistics() {
    this.isLoading = true;
    if (!this.selectedCompanyId || !this.selectedYear) return;

    this.service.post('payroll-statistics', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear
    }).subscribe((res: any) => {
      if (res.status === 'success') {
        this.barChartData.labels = res.data.months;
        this.barChartData.datasets[0].data = res.data.values;

        this.barChartData = { ...this.barChartData };
      }
      this.isLoading = false;
    }, err => {
      console.error("Failed to fetch payroll statistics:", err);
    });
  }

  loadLeaveCards() {
    this.isLoading = true;
    if (!this.selectedCompanyId) return;

    this.service.post('leave-statistics', {
      company_id: this.selectedCompanyId,
    }).subscribe((res: any) => {
      if (res.status === 'success') {
        this.leaveCards = [
          { title: 'Total Leave Request', count: res.data.total, icon: 'bi-calendar-event', bgColor: '#3674B5' },
          { title: 'Approved Leaves', count: res.data.approved, icon: 'bi-calendar2-check', bgColor: '#006D42' },
          { title: 'Pending Leaves', count: res.data.pending, icon: 'bi-calendar2-week', bgColor: '#C8B100' },
          { title: 'Rejected Leaves', count: res.data.rejected, icon: 'bi-calendar-x', bgColor: '#880021' },
        ];
        this.isLoading = false;
      }
    });
  }

  public doughnutChartData!: ChartData<'doughnut'>;
  public doughnutChartOptions!: ChartOptions<'doughnut'>;

  loadAttendanceSummary() {
    this.isLoading = true;
    if (!this.selectedCompanyId) return;

    this.service.post('attendance-summary', {
      company_id: this.selectedCompanyId
    }).subscribe((res: any) => {
      if (res.status === 'success') {
        const attendancePercentages = res.data.percentages;

        const present = Number(attendancePercentages.present);
        const absent = Number(attendancePercentages.absent);
        const lateMarks = Number(attendancePercentages.late_marks);

        this.doughnutChartData = {
          labels: ['Present days', 'Absent days', 'Late Marks'],
          datasets: [
            {
              data: [present, absent, lateMarks],
              backgroundColor: ['#3A79D1', '#7C0A02', '#FFC107'],
              hoverOffset: 10,
            }
          ]
        };

        this.doughnutChartOptions = {
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

        // this.totalAttendanceValue = total;
        this.isLoading = false;
      }
    });
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

  getDashboardSummary() {
    this.isLoading = true;
    if (!this.selectedCompanyId) return;

    this.service.post('dashboard-summary', {
      company_id: this.selectedCompanyId
    }).subscribe((res: any) => {
      if (res.status === 'success') {
        const summary = res.data;
        this.totalEmployee = summary.total_active_employees;
        this.lastMonthSalaryExpense = Number(summary.last_month_salary_expense).toLocaleString('en-IN');
        this.pendingPayrollApprovals = summary.pending_payroll_approvals;
        this.pendingLeaves = summary.pending_leaves;
      }
    });
  }


}
