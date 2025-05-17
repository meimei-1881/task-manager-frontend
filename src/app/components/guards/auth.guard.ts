import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {
    // ตรวจสอบว่าเป็น Browser Environment
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');

      if (token) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      // กรณีไม่ใช่ Browser (เช่น Server-Side)
      this.router.navigate(['/login']);
      return false;
    }
  }
}
