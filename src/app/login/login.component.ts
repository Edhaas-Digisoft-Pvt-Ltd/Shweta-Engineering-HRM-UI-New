import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from '../hrmservice.service';
// import { ApiService } from '../api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loginData: any;
  readonly NoWhitespaceRegExp: RegExp = new RegExp('\\S');
  roles: any;
  logindata: any;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private service: HrmserviceService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('sm1982@gmail.com', [
        Validators.required,
        Validators.email,
        Validators.pattern(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/
        ),
      ]), // Email validation
      password: new FormControl('9423369362', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(this.NoWhitespaceRegExp),
      ]), // Min length validation
      role: new FormControl('1', [
        Validators.required,]), // Required field
    });
  }
  ngOnInit(): void {
    this.getRoles()

  }
  //--------------------------------------------------------------------------------------
  getRoles() {
    this.service.post('fetch/roles', {}).subscribe((res: any) => {
      try {
        if (res.status == "success") {
          this.roles = res.data
        }
      } catch (error) {
        console.log(error);

      }
    })
  }

  //--------------------------------------------------------------------------------------
  login() {
    const body = {
      username: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      role_id: Number(this.loginForm.get('role')?.value)
    };

    this.service.post('login', body).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success('Login successful !!!');
        this.logindata = res.data
        console.log( this.logindata);
        
        sessionStorage.setItem('roleName', this.logindata.employe_role)
        sessionStorage.setItem('employeeId', this.logindata.employe_id)
        sessionStorage.setItem('employeeName', this.logindata.employee_name)
        let roleId = this.loginForm.value.role;
        let role = roleId == 1 ? 'admin' : roleId == 2 ? 'accountant' : 'employee';
        
        sessionStorage.setItem("AUTH", res.token); // Session storage for Auth
        this.service.setRole(role); // Session storage for role

        if (role === 'employee') {
          // this.router.navigate(['/authPanal/EmployeeInDetail'], {
          //   queryParams: { id: this.logindata.employe_id }
          // });
          this.service.setEmployeeId(this.logindata.employe_id);
          console.log('login page', this.logindata.employe_id);
          this.router.navigate(['/authPanal/EmployeeInDetail']);
        }
        if (role === 'accountant') {
          this.router.navigate(['/authPanal/payrollProcess']);
        }
        else if (role === 'admin') {
          this.router.navigate(['/authPanal/Dashboard']);
        }
      } else {
        this.toastr.error(res.message || 'Login failed');
      }

    }, (err) => {
      this.toastr.error(err.error?.message || 'Something went wrong');
    });
  }
  //--------------------------------------------------------------------------------------
  onSubmit() {
    if (this.loginForm.valid) {
      this.login();
    } else {
      console.log('Incorrect Details :', this.loginForm.value);
      this.toastr.error('Invalid credentials !');
    }
  }
  //--------------------------------------------------------------------------------------

  demoAccounts = [
    { role: 'Admin', email: 'sm1982@gmail.com', password: '9423369362' },
    { role: 'Emp', email: 'pravin.j@gmail.com', password: '9823012345' },
    { role: 'Accountant', email: 'sunil15@gmail.com', password: '987545632' }
  ];

  selectedRole: string = ''; 

  selectCredentials(role: string) {
    this.selectedRole = role;

    const account = this.demoAccounts.find(a => a.role === role);
    if (account) {
      this.loginForm.patchValue({
        email: account.email,
        password: account.password
      });
    }
  }


}
