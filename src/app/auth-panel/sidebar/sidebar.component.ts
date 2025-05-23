import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HrmserviceService } from 'src/app/hrmservice.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  constructor(private router: Router, private service: HrmserviceService) { }

  isAccordionOpen1 = false;
  isAccordionOpen2 = false;
  role: string = '';

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
  }
  closeAccordion() {
    this.isAccordionOpen1 = false;
    this.isAccordionOpen2 = false;
  }

  // Set accordion active class if its child route is active
  isActiveLink(link: string): boolean {
    return this.router.isActive(link, false);
  }


  logout(){

    if(confirm("Do you want to logout?") == true){
      // alert("Logout ...");
      this.router.navigate(['']);

    }
    else{
      alert("Stay Here !!!");
    }
    this.service.clearRole();
  }

}
