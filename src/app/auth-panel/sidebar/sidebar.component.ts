import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  empName: any;
  roleName: any;
  constructor(private router: Router, private service: HrmserviceService) {}

  isAccordionOpen1 = false;
  isAccordionOpen2 = false;
  role: string = '';
  adminData: string | null | undefined;

  toggleAccordion(which: 'accordion1' | 'accordion2') {
    if (which === 'accordion1') {
      this.isAccordionOpen1 = !this.isAccordionOpen1;
      if (this.isAccordionOpen1) this.isAccordionOpen2 = false;
    } else if (which === 'accordion2') {
      this.isAccordionOpen2 = !this.isAccordionOpen2;
      if (this.isAccordionOpen2) this.isAccordionOpen1 = false;
    }
  }
  ngOnInit(): void {
    this.role = this.service.getRole();
    // this.adminData= this.service.getRole();
    // this.checkLoginBtn();
    this.empName = sessionStorage.getItem('employeeName')
    this.roleName = sessionStorage.getItem('roleName')
    
  }
  
  closeAccordion(parent?: 'accordion1' | 'accordion2' | 'all') {
    if (parent === 'accordion1') {
      // clicked Payroll -> close Company Settings
      this.isAccordionOpen2 = false;
    } else if (parent === 'accordion2') {
      // clicked Company Settings -> close Payroll
      this.isAccordionOpen1 = false;
    } else if (parent === 'all') {
      // clicked something outside parents (like Configuration, Calendar, Employee, etc.)
      this.isAccordionOpen1 = false;
      this.isAccordionOpen2 = false;
    }
  }

  // Set accordion active class if its child route is active
  isActiveLink(link: string): boolean {
    return this.router.isActive(link, false);
  }
  // checkLoginBtn() {

  //   // console.log(this.service.get)


  //   // console.log( this.service.get(data$))
  // }

  // logout() {
  //   if (confirm('Do you want to logout?') == true) {
  //     // alert("Logout ...");
  //     this.router.navigate(['']);
  //   } else {
  //     alert('Stay Here !!!');
  //   }
  //   this.service.clearRole();
  // }

  logout() {
    let cnf = confirm('Are You sure you want to Log OUT??');
    console.log(cnf);
    
    if (cnf) {
      sessionStorage.clear();
      this.router.navigate(['/']);
    }
  }
}
