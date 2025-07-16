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
      password: new FormControl('942336936', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(this.NoWhitespaceRegExp),
      ]), // Min length validation
      role: new FormControl('admin', [
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
    };

    this.service.post('login', body).subscribe((res: any) => {
      if (res.status == 'success') {
        this.toastr.success('Login successful !!!');
        this.logindata = res.data
        sessionStorage.setItem('roleName', this.logindata.employe_role)
        sessionStorage.setItem('empName', this.logindata.employe_id)
        sessionStorage.setItem('employeeName', this.logindata.employee_name)
        const role = this.loginForm.value.role;
        sessionStorage.setItem("AUTH", res.token); // Session storage for Auth
        this.service.setRole(role); // Session storage for role

        if (role === 'employee') {
          this.router.navigate(['/authPanal/EmployeeInDetail'], {
            queryParams: { id: this.logindata.employe_id }
          });
        }
        if (role === 'accountant') {
          this.router.navigate(['/authPanal/payrollProcess']);
        }
        else if (role === 'admin') {
          this.router.navigate(['/authPanal/Dashboard']);
        }
      }
      else if (res.status === 'error') {
        console.log("eeeeeeeeeeeee");

        alert(res.message)
        this.toastr.error(res.message);
      }
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


}
