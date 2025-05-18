import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // ตรวจสอบว่า user login หรือไม่
    const isLoggedIn = localStorage.getItem('authToken');  // ตรวจสอบ token ใน localStorage

    if (isLoggedIn) {
      // ถ้า login แล้วให้ไปที่หน้าต่อไป
      return true;
    } else {
      // ถ้าไม่ได้ login, ไปหน้า login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
