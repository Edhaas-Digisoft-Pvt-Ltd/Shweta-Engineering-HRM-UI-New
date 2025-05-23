import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';

@Component({
  selector: 'app-company-dashboard',
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.css'],
})
export class CompanyDashboardComponent {
  
  CompanyNameList = [
    {
      name: 'hrishikesh',
    },
    {
      name: 'Onkar',
    },
    {
      name: 'sonal',
    },
    {
      name: 'Shivani',
    },
  ];
  departments = [
    {
      name: 'Accounts',
    },
    {
      name: 'Quality',
    },
    {
      name: 'Shopfloor',
    },
    {
      name: 'Production',
    },
    {
      name: 'Security',
    },
  ];
  designations = [
    {
      name: 'Product Manager',
    },
    {
      name: 'Sr.Accountant',
    },
    {
      name: 'Jr. Trainee engg',
    },
    {
      name: 'Production head',
    },
    {
      name: 'Quality Manager',
    },
  ];
  subCompanys = [
    {
      name: 'sthapathay consultants PVT Ltd',
    },
    {
      name: 'Onkar',
    },
    {
      name: 'sonla',
    },
    {
      name: 'Renuka',
    },
    {
      name: 'Prrita',
    },
    {
      name: 'Prrita',
    },
  ];
}
