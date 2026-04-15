import { EmployeeActionComponent } from '../employee/employee-action/employee-action.component';
import { ColDef } from 'ag-grid-community';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { Component, OnInit, HostListener } from '@angular/core';
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
  searchValue: string = '';
  gridApiActive: any;
  leaveCards: any = [];
  totalAttendanceValue: number = 0;
  isLoading: boolean = false;
  totalEmployee: any = 0;
  lastMonthSalaryExpense: any = 0;
  pendingPayrollApprovals: any = 0;
  pendingLeaves: any = 0;
  activeRequests = 0;
  notificationCount = 0;
  showNotifications = false;
  leavesNotification: any[] = [];
  advSalaryNotification: any[] = [];

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
  }

  startRequest() {
    this.activeRequests++;
    this.isLoading = true; // show loader
  }

  finishRequest() {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.isLoading = false; // hide loader when all requests finished
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
    this.getNotifications();
  }

  onYearChange() {
    this.payrollStatistics();
  }

  getCompanyNames() {
    this.service.post('fetch/company', {}).subscribe((res: any) => {
      if (res.status === 'success') {
        this.CompanyNames = res.data;

        // Check if there's a saved company ID
        const savedCompanyId = this.service.selectedCompanyId();

        // Find saved company if it exists in the new list
        let defaultCompany = null;
        if (savedCompanyId) {
          defaultCompany = this.CompanyNames.find((comp: any) => comp.company_id === savedCompanyId);
        }

        // If no saved or valid company, pick the first one dynamically
        if (!defaultCompany && this.CompanyNames.length > 0) {
          defaultCompany = this.CompanyNames[0];
          this.service.setCompanyId(defaultCompany.company_id);
        }

        // Now select that company
        if (defaultCompany) {
          this.selectCompany(defaultCompany);
        }
      }
    });
  }

  payrollStatistics() {
    if (!this.selectedCompanyId || !this.selectedYear) return;

    this.startRequest();

    this.service.post('payroll-statistics', {
      company_id: this.selectedCompanyId,
      year: this.selectedYear
    }).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.barChartData.labels = res.data.months;
          this.barChartData.datasets[0].data = res.data.values;
          this.barChartData = { ...this.barChartData };
        }
        this.finishRequest();
      },
      error: (err) => {
        console.error(err);
        this.finishRequest();
      }
    });
  }

  toggleNotificationDropdown() {
    this.showNotifications = !this.showNotifications;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Close dropdown when clicking outside
    if (!target.closest('.position-relative.d-inline-block')) {
      this.showNotifications = false;
    }
  }

  getNotifications() {
    this.startRequest();
    this.service.post('dashboard-notifications', {
      company_id: this.selectedCompanyId,
    }).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.notificationCount = res.data.Count || 0;
          this.leavesNotification = res.data.leavesNotification || [];
          this.advSalaryNotification = res.data.advSalaryNotification || [];
        }
        this.finishRequest();
      },
      error: (err) => {
        this.notificationCount = 0;
        this.finishRequest();
      }
    });
  }

  viewAdvanceRequests() {
    this.router.navigate(['authPanal/AdvancePayment']);
  }

  loadLeaveCards() {
    if (!this.selectedCompanyId) return;

    this.startRequest();

    this.service.post('leave-statistics', { company_id: this.selectedCompanyId })
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.leaveCards = [
              { title: 'Total Leave Request', count: res.data.total, icon: 'bi-calendar-event', bgColor: '#3674B5' },
              { title: 'Approved Leaves', count: res.data.approved, icon: 'bi-calendar2-check', bgColor: '#006D42' },
              { title: 'Pending Leaves', count: res.data.pending, icon: 'bi-calendar2-week', bgColor: '#C8B100' },
              { title: 'Rejected Leaves', count: res.data.rejected, icon: 'bi-calendar-x', bgColor: '#880021' },
            ];
          }
          this.finishRequest();
        },
        error: (err) => {
          console.error(err);
          this.finishRequest();
        }
      });
  }

  public doughnutChartData!: ChartData<'doughnut'>;
  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed}%`
        }
      },
      datalabels: {
        display: false
      }
    }
  };


  loadAttendanceSummary() {
    if (!this.selectedCompanyId) return;

    this.startRequest();

    this.service.post('attendance-summary', { company_id: this.selectedCompanyId })
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success' && res.data) {
            const attendancePercentages = res.data.percentages;

            if (
              !attendancePercentages ||
              (attendancePercentages.present == 0 &&
                attendancePercentages.absent == 0 &&
                attendancePercentages.late_marks == 0)
            ) {
              this.doughnutChartData = {
                labels: ['No Attendance Data'],
                datasets: [
                  {
                    data: [100],
                    backgroundColor: ['#D3D3D3'],
                    hoverOffset: 10,
                  },
                ],
              };
              this.totalAttendanceValue = 0;
            } else {
              const present = Number(attendancePercentages.present);
              const absent = Number(attendancePercentages.absent);
              const lateMarks = Number(attendancePercentages.late_marks);

              this.doughnutChartData = {
                labels: ['Present days', 'Absent days'],
                datasets: [
                  {
                    data: [present, absent, lateMarks],
                    backgroundColor: ['#3A79D1', '#7C0A02'],
                    hoverOffset: 10,
                  },
                ],
              };

              this.totalAttendanceValue = present + absent + lateMarks;
            }
          } else {
            this.doughnutChartData = {
              labels: ['No Attendance Data'],
              datasets: [
                {
                  data: [100],
                  backgroundColor: ['#D3D3D3'],
                  hoverOffset: 10,
                },
              ],
            };
            this.totalAttendanceValue = 0;
          }

          this.finishRequest();
        },
        error: (err) => {
          console.error(err);
          this.doughnutChartData = {
            labels: ['No Attendance Data'],
            datasets: [
              {
                data: [100],
                backgroundColor: ['#D3D3D3'],
                hoverOffset: 10,
              },
            ],
          };
          this.totalAttendanceValue = 0;

          this.finishRequest();
        }
      });
  }

  leaveRequest() {
    this.router.navigate(['/authPanal/Leave']);
  }

  totalAttendance() {
    this.router.navigate(['/authPanal/Attendance']);
  }

  paymentStatistics() {
    this.router.navigate(['/authPanal/payrollList']);
  }

  viewEmployee() {
    this.router.navigate(['/authPanal/Employee']);
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
    if (!this.selectedCompanyId) return;

    this.startRequest(); // start loader

    this.service.post('dashboard-summary', { company_id: this.selectedCompanyId })
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            const summary = res.data;
            this.totalEmployee = summary.total_active_employees;
            this.lastMonthSalaryExpense = Number(summary.last_month_salary_expense).toLocaleString('en-IN');
            this.pendingPayrollApprovals = summary.pending_payroll_approvals;
            this.pendingLeaves = summary.pending_leaves;
          }
          this.finishRequest(); // finish loader
        },
        error: (err) => {
          console.error(err);
          this.finishRequest(); // finish loader
        }
      });
  }

}
