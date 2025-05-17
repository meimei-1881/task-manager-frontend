// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = environment.apiBaseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/register`, { username, password });
  }
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/login`, { username, password });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      return !!window.localStorage.getItem('token');
    }
    return false;
  }

}
