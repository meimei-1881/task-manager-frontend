import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {environment} from '../../environments/environment';

export interface User {
  ID: number;
  name: string;
  email: string;
  avatar?: string;
  // เพิ่ม properties อื่นๆ ตามที่ backend ส่งมา
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${environment.apiBaseUrlAPI}/users`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  // ดึงข้อมูลผู้ใช้ทั้งหมดจาก API
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`)
      .pipe(
        tap(users => console.log('Fetched users:', users))
      );
  }

  // ดึงข้อมูลผู้ใช้ปัจจุบัน
  loadCurrentUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<User>(`${this.apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.clearCurrentUser()
      });
    }
  }

  // ตั้งค่าผู้ใช้ปัจจุบัน
  setCurrentUser(user: User, token: string): void {
    localStorage.setItem('token', token);
    this.currentUserSubject.next(user);
  }

  // ดึงข้อมูลผู้ใช้ปัจจุบัน (สำหรับใช้ใน Component)
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // ล้างข้อมูลผู้ใช้ปัจจุบัน (เมื่อล็อกเอ้าท์)
  clearCurrentUser(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  // ดึงข้อมูลผู้ใช้ตาม ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }
}
