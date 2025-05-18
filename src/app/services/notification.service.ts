import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {environment} from '../../environments/environment';

export interface Notification {
  id: string;
  message: string;
  type: 'task_update' | 'task_delete' | 'message';
  taskId?: string;
  read: boolean;
  createdAt: string;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  // Observable สำหรับ components อื่นๆ subscribe
  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();
  private apiUrl = `${environment.apiBaseUrlAPI}/notifications`;

  constructor(private http: HttpClient) {
    this.setupWebSocket();
  }

  loadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap((notifications) => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      })
    );
  }


  /**
   * ทำเครื่องหมาย notification ว่าอ่านแล้ว
   */
  markAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${notificationId}/mark-read`, {}).pipe(
      tap(() => {
        const updated = this.notificationsSubject.value.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        this.notificationsSubject.next(updated);
        this.updateUnreadCount();
      })
    );
  }

  /**
   * ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว
   */
  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => {
        const updated = this.notificationsSubject.value.map(n => ({
          ...n,
          read: true
        }));
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(0);
      })
    );
  }

  /**
   * เชื่อมต่อ WebSocket สำหรับ real-time notifications
   */
  private setupWebSocket() {
    const ws = new WebSocket(environment.webSocket);

    ws.onmessage = (event) => {
      const notification: Notification = JSON.parse(event.data);
      this.addNotification(notification);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setTimeout(() => this.setupWebSocket(), 5000); // Reconnect after 5 seconds
    };
  }

  /**
   * เพิ่ม notification ใหม่
   */
  private addNotification(notification: Notification) {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
    if (!notification.read) {
      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    }
  }

  /**
   * อัปเดทจำนวน unread notifications
   */
  private updateUnreadCount() {
    const count = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(count);
  }

  /**
   * ลบ notification
   */
  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`).pipe(
      tap(() => {
        const updated = this.notificationsSubject.value.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(updated);
        this.updateUnreadCount();
      })
    );
  }
}
