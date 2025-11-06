import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HttpEvent,
  HttpParams,
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HrmserviceService {
  data$: any;
  subscribe(arg0: (data: any) => void) {
    throw new Error('Method not implemented.');
  }

  // url: string = 'http://127.0.0.1:8000/api/v1/';

  // url: string = 'https://edhaasdigisoft.co.in/shwetapayroll/api/v1/';
  url: string = 'http://127.0.0.1:8000/api/v1/'; 


  constructor(private router: Router, private httpClient: HttpClient) {
    this.loadRoleFromStorage();
    this.loadPermissionsFromStorage();
    this.loadCompanyIdFromStorage();
   }

  get(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams(),
      };
    }
    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }
    return this.httpClient.get(this.url + '/' + endpoint, reqOpts);
  }
  // post(endpoint: string, body: any, params?: any, reqOpts?: any) {
  //   if (!reqOpts) {
  //     reqOpts = {
  //       params: new HttpParams(),
  //     };
  //   }
  //   // Support easy query params for GET requests
  //   if (params) {
  //     reqOpts.params = new HttpParams();
  //     for (let k in params) {
  //       reqOpts.params = reqOpts.params.set(k, params[k]);
  //     }
  //   }
  //   // console.log("Body :"+JSON.stringify(body));
  //   return this.httpClient.post(this.url + endpoint, body, reqOpts);
  // }

  // JWT+POST

  post(endpoint: string, body: any, params?: any, reqOpts?: any, includeCredentials?: boolean) {
    // Retrieve the JWT token and additional token from storage
    const jwtToken = sessionStorage.getItem('AUTH') || '';

    // If request options aren't provided, set default headers and params
    if (!reqOpts) {
      reqOpts = {
        headers: new HttpHeaders({
          'Authorization': jwtToken,  // Setting up the Authorization Header

        }),
        params: new HttpParams(),
      };
    } else {
      // If headers exist, append the Authorization header, otherwise create headers
      reqOpts.headers = reqOpts.headers
        ? reqOpts.headers.set('Authorization', 'Bearer ' + jwtToken)
        : new HttpHeaders({ 'Authorization': 'Bearer ' + jwtToken });
    }

    // If params are provided, append them to the HttpParams object
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }

    // Only set `withCredentials` if `includeCredentials` is explicitly provided
    if (includeCredentials !== undefined) {
      reqOpts.withCredentials = includeCredentials;
    }


    return this.httpClient.post(this.url + endpoint, body, reqOpts);
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.httpClient.put(this.url + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.httpClient.delete(this.url + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.httpClient.patch(this.url + '/' + endpoint, body, reqOpts);
  }

  // private roleKey = 'logIn';

  private roleKey = 'role';
  setRole(role: string): void {
    sessionStorage.setItem(this.roleKey, role);
    this._role = role;
  }
  private _role: string = '';
  getRole(): string {
    return this._role || '';
  }
  private loadRoleFromStorage() {
    const role = sessionStorage.getItem(this.roleKey);
    if (role) this._role = role;
  }

  clearRole(): void {
    sessionStorage.removeItem(this.roleKey);
  }

  //signal =========================================================================================
  private _selectedCompanyId = signal<number | null>(null); //storing company id 

  setCompanyId(id: number) {
    this._selectedCompanyId.set(id);   //temp store company id
    sessionStorage.setItem('selectedCompanyId', id.toString());
  }

  selectedCompanyId = this._selectedCompanyId.asReadonly(); //display company id

  loadCompanyIdFromStorage() {
    const storedId = sessionStorage.getItem('selectedCompanyId');
    if (storedId) {
      this._selectedCompanyId.set(Number(storedId));
    }
  }

  //signal - store employee id =====================================================================
  private _EmployeeId = signal<number | null>(null);

  setEmployeeId(id: number) {
    this._EmployeeId.set(id);
    console.log('service', this._EmployeeId);
  }

  EmployeeId = this._EmployeeId.asReadonly();

  // Fetch roles
  fetchRoles() {
    return this.post('fetch/roles', {});
  }

  // Fetch modules
  fetchModules() {
    return this.post('modules', {});
  }

  // Fetch permissions
  fetchPermissions() {
    return this.post('permissions', {});
  }

  // Fetch role-permissions
  fetchRolePermissions(role_id: number) {
    return this.post('role/permissions', { role_id });
  }

  // Assign role-permissions
  assignRolePermissions(role_id: number, permissions: any) {
    return this.post('assign-role-permissions', { role_id, permissions });
  }

  // Fetch employee permissions
  // fetchEmployeePermissions(employee_id: number) {
  //   return this.post('employee/permissions', { employee_id });
  // }

  // Permission cache
  private permissions: { [module: string]: string[] } = {};
  setPermissions(data: any[]) {
    this.permissions = {};
    data.forEach(item => {
      const moduleName = item.module?.module_name;
      const permissionName = item.permission?.permission_name?.toLowerCase();
      if (moduleName && permissionName) {
        if (!this.permissions[moduleName]) this.permissions[moduleName] = [];
        this.permissions[moduleName].push(permissionName);
      }
    });
    sessionStorage.setItem('permissions', JSON.stringify(this.permissions));
  }

  private loadPermissionsFromStorage() {
    const stored = sessionStorage.getItem('permissions');
    if (stored) this.permissions = JSON.parse(stored);
  }

  hasPermission(module: string, permission: string): boolean {
    module = module.trim();
    permission = permission.trim().toLowerCase();
    return this.permissions[module]?.includes(permission) || false;
  }

  getPermissions() {
    return this.permissions;
  }

  fetchEmployeePermissions(employee_id: number) { return this.post('employee/permissions', { employee_id }); }

  clearPermissions() {
    this.permissions = {};
    sessionStorage.removeItem('permissions');
  }

}
