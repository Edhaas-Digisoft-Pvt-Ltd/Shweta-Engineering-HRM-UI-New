import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SidebarComponent } from './auth-panel/sidebar/sidebar.component';
import { AuthPanelComponent } from './auth-panel/auth-panel.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CompnaySetupComponent } from './compnay-setup/compnay-setup.component';
import { CreateaccountComponent } from './createaccount/createaccount.component';
import { EmployeeComponent } from './employee/employee.component';

import { AttendanceComponent } from './attendance/attendance.component';
import { CalenderComponent } from './calender/calender.component';
import { NewcalenderComponent } from './newcalender/newcalender.component';
import { LeaveComponent } from './leave/leave/leave.component';
import { PayrollListComponent } from './payroll/payroll-list/payroll-list.component';
// import { PayrollListComponent } from './payroll-list/payroll-list.component'
import { PayrollSummariesComponent } from './payroll/payroll-list/payroll-summaries/payroll-summaries.component';
// import { PayrollSummariesComponent } from './payroll-list/payroll-summaries/payroll-summaries.component';
import { PayrollProcessComponent } from './payroll/payroll-process/payroll-process.component';
import { SalaryRevisionComponent } from './payroll/salary-revision/salary-revision.component';
import { AdvancePaymentComponent } from './advance-payment/advance-payment.component';
import { DemoComponent } from './demo/demo.component';
import { Demo2Component } from './demo2/demo2.component';
import { CompanyListComponent } from './compnay-setup/company-list/company-list.component';
import { ComMangeAndPoliciesComponent } from './compnay-setup/com-mange-and-policies/com-mange-and-policies.component';
import { LeaveSetupComponent } from './compnay-setup/leave-setup/leave-setup.component';
import { CompanyDashboardComponent } from './compnay-setup/company-list/company-dashboard/company-dashboard.component';
import { CreateEmployeeComponent } from './employee/create-employee/create-employee.component';
import { EmployeeDashboardComponent } from './employee/employee-dashboard/employee-dashboard.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LoginComponent,
  },
  {
    path: 'authPanal',
    component: AuthPanelComponent,
    children: [
      {
        path: '',
        redirectTo: 'Dashboard',  // Redirect empty child path to Dashboard
        pathMatch: 'full',
      },
      {
        path: 'Dashboard',
        component: DashboardComponent,
      },
      {
        path: 'CompanySetup',
        component: CompnaySetupComponent,
      },
      {
        path: 'demo',
        component: DemoComponent,
      },
      {
        path: 'demo2',
        component: Demo2Component,
      },
      {
        path: 'Employee',
        component: EmployeeComponent,
      },
      {
        path: 'CreateEmployee',
        component: CreateEmployeeComponent,
      },
      {
        path: 'EmployeeDashboard',
        component: EmployeeDashboardComponent,
      },
      {
        path: 'Attendance',
        component: AttendanceComponent,
      },
      {
        path: 'Calender',
        component: CalenderComponent,
      },
      {
        path: 'Calender2',
        component: NewcalenderComponent,
      },
      {
        path: 'Leave',
        component: LeaveComponent,
      },
      {
        path: 'payrollList',
        component: PayrollListComponent,
      },
      {
        path: 'payrollProcess',
        component: PayrollProcessComponent,
      },
      {
        path: 'payrollSummary',
        component: PayrollSummariesComponent,
      },
      {
        path: 'salaryRevision',
        component: SalaryRevisionComponent,
      },
      {
        path: 'AdvancePayment',
        component: AdvancePaymentComponent,

      },
      {
        path: 'companyList',
        component: CompanyListComponent,

      },
      {
        path: 'CompanyDashboard',
        component: CompanyDashboardComponent,

      },
      {
        path: 'comMange&Plolicies',
        component: ComMangeAndPoliciesComponent,

      },
      {
        path: 'LeaveSetup',
        component: LeaveSetupComponent,

      },
    ]
  },

  {
    path: 'CreateAccount',
    component: CreateaccountComponent,
  }


];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {



}
