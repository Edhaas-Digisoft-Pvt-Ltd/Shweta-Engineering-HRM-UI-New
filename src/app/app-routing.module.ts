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

import { BonusAndIncentiveComponent } from './compnay-setup/bonus-and-incentive/bonus-and-incentive.component';
import { ConfigurationComponent } from './configuration/configuration.component';

import { PermissionGuard } from './permission.guard';
import { PermissionsResolver } from './permissions.resolver';
import { EmpLeaveAdvsalaryReportComponent } from './emp-leave-advsalary-report/emp-leave-advsalary-report.component';
import { LeaveRequestComponent } from './leave/leave-request/leave-request.component';
import { UpdateEmployeeComponent } from './employee/update-employee/update-employee.component';
import { SalaryIncrementComponent } from './salary-increment/salary-increment.component';
import { EmployeeVerifiedAttendanceComponent } from './employee-verified-attendance/employee-verified-attendance.component';

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
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Dashboard', permission: 'view' } 
      },
      {
        path: 'CompanySetup',
        component: CompnaySetupComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Company Settings', permission: 'view' }
      },
      {
        path: 'BonusAndIncentive',
        component: BonusAndIncentiveComponent ,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Configuration', permission: 'view' }
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
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Employee', permission: 'view' }
      },
      {
        path: 'CreateEmployee',
        component: CreateEmployeeComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Employee', permission: 'view' }
      },
      {
        path: 'UpdateEmployee',
        component: UpdateEmployeeComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Employee', permission: 'update' }
      },
      {
        path: 'EmployeeInDetail',
        component: EmployeeDashboardComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Employee Dashboard', permission: 'view' }
      },
      {
        path: 'Attendance',
        component: AttendanceComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Attendance', permission: 'view' }
      },
      {
        path: 'Calender',
        component: CalenderComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'calender', permission: 'view' }
      },
      {
        path: 'Calender2',
        component: NewcalenderComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'calender', permission: 'view' }
      },
      {
        path: 'Leave',
        component: LeaveRequestComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Leave', permission: 'view' }
      },
      {
        path: 'payrollList',
        component: PayrollListComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Payroll List', permission: 'view' }
      },
      {
        path: 'payrollProcess',
        component: PayrollProcessComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Payroll Manage', permission: 'view' }
      },
      {
        path: 'payrollSummary',
        component: PayrollSummariesComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Payroll', permission: 'view' }
      },
      {
        path: 'salaryRevision',
        component: SalaryRevisionComponent,
      },
      {
        path: 'AdvancePayment',
        component: AdvancePaymentComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Advance Payment', permission: 'view' }
      },
      {
        path: 'companyList',
        component: CompanyListComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Company List', permission: 'view' }
      },
      {
        path: 'CompanyDashboard',
        component: CompanyDashboardComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Company List', permission: 'view' }
      },
      {
        path: 'comMange&Plolicies',
        component: ComMangeAndPoliciesComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Manage and Policies', permission: 'view' }
      },
      // {
      //   path: 'LeaveSetup',
      //   component: LeaveSetupComponent,

      // },
      {
        path: 'configuration',
        component: ConfigurationComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Configuration', permission: 'view' }
      },
      {
        path: 'employee-report',
        component: EmpLeaveAdvsalaryReportComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Employee Dashboard', permission: 'view' }
      },
      {
        path: 'salary_increment',
        component: SalaryIncrementComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Salary_increment', permission: 'view' }
      },
      {
        path: 'employee-verified-attendance',
        component: EmployeeVerifiedAttendanceComponent,
        canActivate: [PermissionGuard],
        resolve: { permissions: PermissionsResolver },
        data: { module: 'Employee Dashboard', permission: 'view' }
      },
    ]
  },

  {
    path: 'CreateAccount',
    component: CreateaccountComponent,
  }


];


@NgModule({
  imports: [RouterModule.forRoot(routes,{
   
      useHash: true
   
  })],
  exports: [RouterModule]
})
 
export class AppRoutingModule {



}
