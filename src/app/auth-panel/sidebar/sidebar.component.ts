import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
import { HostListener } from '@angular/core';
declare var bootstrap: any;
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  role = '';
  permissions: any = {};
  empName: any;
  roleName: any;
  constructor(private router: Router, private service: HrmserviceService) {}

  isAccordionOpen1 = false;
  isAccordionOpen2 = false;
  // role: string = '';
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
    this.empName = sessionStorage.getItem('employeeName');
    this.roleName = sessionStorage.getItem('roleName');

    const employeeId = sessionStorage.getItem('employeeId');
    if (employeeId) {
      this.service.fetchEmployeePermissions(+employeeId).subscribe(
        (res: any) => {
          if (res.status === 'success') {
            this.service.setPermissions(res.data);
            this.permissions = this.service.getPermissions();
          }
        },
        (err) => console.error('Error fetching permissions on refresh', err)
      );
    }
  }

  hasAccess(module: string, permission: string): boolean {
    return this.service.hasPermission(module, permission);
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

      sessionStorage.removeItem('permissions');
    }
  }

  payrollToggle = false;
  companyToggle = false;

  // togglePayrole() {
  //   this.payrollToggle = !this.payrollToggle;
  //   this.companyToggle = false;
  // }
  // toggleCompany() {
  //   this.companyToggle = !this.companyToggle;
  //   this.payrollToggle = false;
  // }
  closeAllAccordions() {
    const openAccordions = document.querySelectorAll(
      '.accordion-collapse.show'
    );
    openAccordions.forEach((item) => {
      const bsCollapse =
        bootstrap.Collapse.getInstance(item) ||
        new bootstrap.Collapse(item, { toggle: false });
      bsCollapse.hide();
    });
    this.payrollToggle = false;
    this.companyToggle = false;
  }

    togglePayrole(event: MouseEvent) {
    event.stopPropagation();
    this.payrollToggle = !this.payrollToggle;
    this.companyToggle = false;
  }
  toggleCompany(event: MouseEvent) {
    event.stopPropagation();
    this.companyToggle = !this.companyToggle;
    this.payrollToggle = false;
  }
 
  onBoxClick(event: MouseEvent) {
    event.stopPropagation(); // Prevent closing when clicking inside the box
  }
 
  // Close the box when clicking anywhere else
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.payrollToggle = false;
    this.companyToggle = false;
  }
}
