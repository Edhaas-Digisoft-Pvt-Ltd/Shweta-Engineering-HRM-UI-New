import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { HrmserviceService } from './hrmservice.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  private alertShown = false; // 👈 prevent repeated alerts

  constructor(private service: HrmserviceService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const role = this.service.getRole();
    if (!role) {
      // if not logged in → you can still navigate to login
      window.location.href = '/'; // or return false to block silently
      return false;
    }

    const module = route.data['module'];
    const permission = route.data['permission'];

    if (module && permission && !this.service.hasPermission(module, permission)) {
      if (!this.alertShown) {
        this.alertShown = true;
        alert('You do not have permission to access this page');
        this.alertShown = false;
      }

      // 👇 Do NOT navigate anywhere. Just block access.
      return false;
    }

    return true;
  }
}
