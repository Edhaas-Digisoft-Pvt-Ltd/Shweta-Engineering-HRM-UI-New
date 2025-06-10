import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SidebarComponent } from './auth-panel/sidebar/sidebar.component';
import { AuthPanelComponent } from './auth-panel/auth-panel.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CompnaySetupComponent } from './compnay-setup/compnay-setup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateaccountComponent } from './createaccount/createaccount.component';
import { EmployeeComponent } from './employee/employee/employee.component';
import { AgGridModule } from 'ag-grid-angular';
import { EmployeeEditComponent } from './employee/employee-edit/employee-edit.component';
import { EmployeeInDetailComponent } from './employee/employee-in-detail/employee-in-detail.component';
import { EmployeeActionComponent } from './employee/employee-action/employee-action.component';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartType } from 'chart.js';
import { CreateemployeeComponent } from './employee/createemployee/createemployee.component';
import { CreateuserComponent } from './employee/createuser/createuser.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalenderComponent } from './calender/calender.component';
import { NewcalenderComponent } from './newcalender/newcalender.component';
import { AttendanceDataComponent } from './dashboard/dashboardComponent/attendance-data/attendance-data.component';
import { AttendanceSummaryComponent } from './attendance/attendance-summary/attendance-summary.component';
import { LeaveComponent } from './leave/leave/leave.component';
import { LeaveRequestComponent } from './leave/leave-request/leave-request.component';
import { UpcommingEventsComponent } from './dashboard/dashboardComponent/upcomming-events/upcomming-events.component';
import { ApprovedAdvancePaymentComponent } from './advance-payment/approved-advance-payment/approved-advance-payment.component';
import { ConsolidateAttendanceSummaryComponent } from './attendance/consolidate-attendance-summary/consolidate-attendance-summary.component';
import { AttendanceActionComponent } from './attendance/attendance-action/attendance-action.component';
import { AdvancePaymentComponent } from './advance-payment/advance-payment.component';
import { PayrollListComponent } from './payroll/payroll-list/payroll-list.component';
import { PayrollActionBtnComponent } from './payroll/payroll-list/payroll-action-btn/payroll-action-btn.component';
import { PayrollSummariesComponent } from './payroll/payroll-list/payroll-summaries/payroll-summaries.component';
import { AdvanceSalaryBtnComponent } from './payroll/payroll-list/payroll-summaries/advance-salary-btn/advance-salary-btn.component';
import { PayrollProcessComponent } from './payroll/payroll-process/payroll-process.component';
import { SalaryRevisionComponent } from './payroll/salary-revision/salary-revision.component';
import { HttpClientModule } from '@angular/common/http';
import { DemoComponent } from './demo/demo.component';
import { Demo2Component } from './demo2/demo2.component';
import { CompanyListComponent } from './compnay-setup/company-list/company-list.component';
import dayGridPlugin from '@fullcalendar/daygrid';
import { ComMangeAndPoliciesComponent } from './compnay-setup/com-mange-and-policies/com-mange-and-policies.component';
import { LeaveSetupComponent } from './compnay-setup/leave-setup/leave-setup.component';
import { CompanyDashboardComponent } from './compnay-setup/company-list/company-dashboard/company-dashboard.component';
import { EditLeaveRequestComponent } from './leave/leave-request/edit-leave-request/edit-leave-request.component';

// FullCalendarModule.registerPlugins([dayGridPlugin]);

//onkar
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SidebarComponent,
    AuthPanelComponent,
    DashboardComponent,
    CompnaySetupComponent,
    CreateaccountComponent,
    EmployeeComponent,
    EmployeeEditComponent,
    EmployeeInDetailComponent,
    EmployeeActionComponent,
    CreateemployeeComponent,
    CreateuserComponent,
    AttendanceComponent,
    CalenderComponent,
    NewcalenderComponent,
    AttendanceActionComponent,
    AttendanceDataComponent,
    AttendanceSummaryComponent,
    LeaveComponent,
    LeaveRequestComponent,
    PayrollListComponent,
    PayrollActionBtnComponent,
    PayrollSummariesComponent,
    AdvanceSalaryBtnComponent,
    PayrollProcessComponent,
    SalaryRevisionComponent,
    CompanyListComponent,
    AdvancePaymentComponent,
    UpcommingEventsComponent,
    ApprovedAdvancePaymentComponent,
    ConsolidateAttendanceSummaryComponent,
    DemoComponent,
    Demo2Component,
    ComMangeAndPoliciesComponent,
    LeaveSetupComponent,
    CompanyDashboardComponent,
    EditLeaveRequestComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    AgGridModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgChartsModule,
    FormsModule,
    FullCalendarModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {


}
