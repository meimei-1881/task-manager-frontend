import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import {NotificationBellComponent} from './components/notification-bell/notification-bell.component'; // ตรวจสอบ path ให้ถูกต้อง

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    NotificationBellComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public authService: AuthService) {} // ใช้ public เพื่อให้ template เข้าถึงได้

  title = 'task-manager-frontend';
}
