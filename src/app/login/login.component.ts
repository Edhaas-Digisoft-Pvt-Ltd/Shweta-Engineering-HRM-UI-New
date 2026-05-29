import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HrmserviceService } from '../hrmservice.service';

// Define which role_names are "office" roles (case-insensitive match)
const OFFICE_ROLES = ['admin', 'accountant'];

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  roles: any[] = [];
  filteredRoles: any[] = [];
  logindata: any;
  showPassword: boolean = false;
  loginType: 'office' | 'employee' = 'employee'; // default

  readonly NoWhitespaceRegExp: RegExp = new RegExp('\\S');

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private service: HrmserviceService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(this.NoWhitespaceRegExp),
      ]),
      role: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.getRoles();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Called when radio button changes
  onLoginTypeChange() {
    this.loginForm.get('role')?.reset('');
    this.filterRoles();
    // Store the login type flag immediately
    localStorage.setItem('loginType', this.loginType);
  }

  filterRoles() {
    if (this.loginType === 'office') {
      // Show ONLY admin and accountant
      this.filteredRoles = this.roles.filter(r =>
        OFFICE_ROLES.includes(r.role_name.toLowerCase())
      );
    } else {
      // Show all roles EXCEPT admin
      this.filteredRoles = this.roles.filter(r =>
        r.role_name.toLowerCase() !== 'admin'
      );
    }
  }

  getRoles() {
    this.service.post('fetch/roles', {}).subscribe((res: any) => {
      try {
        if (res.status === 'success') {
          this.roles = res.data;
          this.filterRoles(); // Apply filter after roles load
        }
      } catch (error) {
        console.log(error);
      }
    });
  }

  login() {
    this.service.setRole('');
    this.service.clearPermissions();

    const body = {
      username: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      role_id: Number(this.loginForm.get('role')?.value),
    };

    this.service.post('login', body).subscribe(
      (res: any) => {
        if (res.status === 'success') {
          this.toastr.success('Login successful !!!');
          this.logindata = res.data;

          sessionStorage.setItem('roleName', this.logindata.employe_role);
          sessionStorage.setItem('employeeId', this.logindata.employe_id);
          sessionStorage.setItem('employeeName', this.logindata.employee_name);
          sessionStorage.setItem('AUTH', res.token);

          // Store loginType flag for UI decisions after login
          localStorage.setItem('loginType', this.loginType);

          this.service.fetchEmployeePermissions(this.logindata.employe_id).subscribe(
            (permRes: any) => {
              if (permRes.status === 'success') {
                this.service.setPermissions(permRes.data);

                const selectedRoleId = Number(this.loginForm.value.role);
                const selectedRole = this.roles.find((r: any) => r.role_id === selectedRoleId);
                const roleName = selectedRole ? selectedRole.role_name.toLowerCase() : '';
                this.service.setRole(roleName);

                this.navigateByRole(roleName);
              } else {
                this.toastr.error('Failed to fetch permissions');
              }
            },
            (error) => {
              console.error('Error fetching permissions', error);
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

  navigateByRole(roleName: string) {
    // If loginType is 'employee', always go to employee dashboard
    if (this.loginType === 'employee') {
      this.service.setEmployeeId(this.logindata.employe_id);
      this.router.navigate(['/authPanal/EmployeeInDetail']);
      return;
    }

    // Office use — route by role name
    switch (roleName) {
      case 'accountant':
        this.router.navigate(['/authPanal/payrollProcess']);
        break;
      case 'admin':
        this.router.navigate(['/authPanal/Dashboard']);
        break;
      default:
        this.toastr.error('Unknown role. Please contact admin.');
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.login();
    } else {
      this.loginForm.markAllAsTouched();
      this.toastr.error('Invalid credentials!');
    }
  }
}