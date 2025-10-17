import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HrmserviceService } from './hrmservice.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PermissionsResolver implements Resolve<any> {
  constructor(private service: HrmserviceService) {}

  resolve(): Observable<any> {
    const employeeId = sessionStorage.getItem('employeeId');
    if (!employeeId) return of(null);

    return this.service.fetchEmployeePermissions(+employeeId).pipe(
      tap((res: any) => {
        if (res.status === 'success') {
          this.service.setPermissions(res.data); // save permissions in service
        }
      }),
      catchError(() => of(null)) // ignore errors
    );
  }
}
