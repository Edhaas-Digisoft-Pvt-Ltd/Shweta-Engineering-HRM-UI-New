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

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private service: HrmserviceService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/
        ),
      ]), // Email validation
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(this.NoWhitespaceRegExp),
      ]), // Min length validation
      role: new FormControl('',[
        Validators.required,]), // Required field
    });
  }

  login() {
    const body = {
      Username: this.loginForm.get('email')?.value,
      PasswordHash: this.loginForm.get('password')?.value,
      User_Role: this.loginForm.get('role')?.value,
    };
    this.service.post('/loginemp', body).subscribe((res: any) => {
      if (res.status == 'success') {
        console.log('Form Submitted:', this.loginForm.value);
        this.toastr.success('Login successful !!!');
        this.router.navigate(['/authPanal/Dashboard']);
      } else {
        this.toastr.error('Please Check Detail !!!');
      }
    });
  }

  // onSubmit() {
  //   if (this.loginForm.valid) {
  //     console.log(this.loginData);
  //     // this.login();
  //     this.router.navigate(['/authPanal/Dashboard']);

  //   } else {
  //     console.log("Incorrect Details :", this.loginForm.value);
  //     this.toastr.error('Invalid credentials !');
  //   }
  // }

  // onRegisterSubmit() {
  //   alert("Working on register");
  // }
  employeID: any;
  onSubmit() {
    if (this.loginForm.valid) {
      const role = this.loginForm.value.role;
      this.service.setRole(role);
      this.router.navigate(['/authPanal/Dashboard']);
      // this.login();
      console.log(this.loginForm);
      if (role === 'employee') {
        this.router.navigate(['/authPanal/EmployeeInDetail']);
      }
      if (role === 'accountant') {
        this.router.navigate(['/authPanal/payrollProcess']);
      }
    } else {
      console.log('Incorrect Details :', this.loginForm.value);
      this.toastr.error('Invalid credentials !');
    }
  }

  onRegisterSubmit() {
    alert('Working on register');
    // this.router.navigate(['/authPanal/Dashboard']);
  }
}
