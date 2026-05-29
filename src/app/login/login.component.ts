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
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private service: HrmserviceService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/),
      ]), // Email validation
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(this.NoWhitespaceRegExp),
      ]), // Min length validation
      role: new FormControl('', [
        Validators.required,]), // Required field
    });
  }
  
  ngOnInit(): void {
    this.getRoles()
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  //--------------------------------------------------------------------------------------
  getRoles() {
    this.service.post('fetch/roles', {}).subscribe((res: any) => {
      try {
        if (res.status == "success") {
          this.roles = res.data
          console.log(this.roles)
        }
      } catch (error) {
        console.log(error);

      }
    })
  }

  //--------------------------------------------------------------------------------------

  login() {
    this.service.setRole('');
    this.service.clearPermissions();

    const body = {
      username: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      role_id: Number(this.loginForm.get('role')?.value)
    };

    this.service.post('login', body).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Login successful !!!');
          this.logindata = res.data;

          // Store basic info in session
          sessionStorage.setItem('roleName', this.logindata.employe_role);
          sessionStorage.setItem('employeeId', this.logindata.employe_id);
          sessionStorage.setItem('employeeName', this.logindata.employee_name);
          sessionStorage.setItem('AUTH', res.token);

          // Fetch permissions first
          this.service.fetchEmployeePermissions(this.logindata.employe_id).subscribe(
            (permRes: any) => {
              if (permRes.status === 'success') {
                //  Save permissions
                this.service.setPermissions(permRes.data);

                // sessionStorage.setItem('permissions', JSON.stringify(permRes.data));
                // Now set role
                const selectedRoleId = Number(this.loginForm.value.role);
                const selectedRole = this.roles.find((r: any) => r.role_id === selectedRoleId);
                const roleName = selectedRole ? selectedRole.role_name.toLowerCase() : '';
                this.service.setRole(roleName);

                // Navigate only after permissions are set
                // switch (roleName) {
                //   case 'operator':
                //     this.service.setEmployeeId(this.logindata.employe_id);
                //     this.router.navigate(['/authPanal/EmployeeInDetail']);
                //     break;

                //   case 'accountant':
                //     this.router.navigate(['/authPanal/payrollProcess']);
                //     break;

                //   case 'admin':
                //     this.router.navigate(['/authPanal/Dashboard']);
                //     break;

                //   default:
                //     this.toastr.error('Unknown role. Please contact admin.');
                //     break;
                // }
                if (roleName === 'accountant') {
                  this.router.navigate(['/authPanal/payrollProcess']);
                }
                else if (roleName === 'admin') {
                  this.router.navigate(['/authPanal/Dashboard']);
                }
                else if (roleName === 'operator' || roleName === 'supervisor' || roleName === 'manager' || roleName === 'maintenance manager'
                  || roleName === 'production manager' || roleName === 'quality manager' || roleName === 'data-entry operator'
                  || roleName === 'production incharge' || roleName === 'plant incharge'
                ) {
                  this.service.setEmployeeId(this.logindata.employe_id);
                  this.router.navigate(['/authPanal/EmployeeInDetail']);
                }
                else {
                  this.toastr.error('Unknown role. Please contact admin.');
                }
              } else {
                this.toastr.error('Failed to fetch permissions');
              }
            },
            (error) => {
              console.error('Error fetching employee permissions', error);
              this.toastr.error('Failed to fetch permissions');
            }
          );
        } else {
          this.toastr.error(res.message || 'Login failed');
        }
      },
      (err) => {
        this.toastr.error(err.error?.message || 'Something went wrong');
      }
    );
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
    { role: 'Admin', email: 'sepl1@gmail.com', password: '9552113579' },
    { role: 'Accountant', email: 'accountant@gmail.com', password: '9999999999' }
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
