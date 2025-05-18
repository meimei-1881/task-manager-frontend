import { Component, inject, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailDialogComponent } from '../task-detail-dialog/task-detail-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SafeHtmlPipe } from '../../safe-html.pipe';
import { TaskService } from '../../services/task.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    CommonModule,
    SafeHtmlPipe,
  ],
  providers: [DatePipe],
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit {
  showPanel = false;

  // ประกาศ property โดยไม่กำหนดค่าเริ่มต้น
  notifications$!: Observable<any[]>;
  unreadCount$!: Observable<number>;

  constructor(
    private notificationService: NotificationService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$;

    this.notificationService.loadNotifications().subscribe({
      error: (err) => console.error('Failed to load notifications', err)
    });
  }

  toggleNotifications() {
    this.showPanel = !this.showPanel;
  }

  handleNotificationClick(noti: any) {
    console.log('notification', noti);
    if (!noti.read) {
      this.notificationService.markAsRead(noti.id).subscribe();
    }

    if (noti.type === 'delete') {
      this.snackBar.open('This task has been deleted', 'Close', {
        duration: 3000
      });
      return;
    }

    if (noti.task_id) {
      this.showPanel = false;
      this.taskService.getTask(noti.task_id).subscribe({
        next: (task) => this.openTaskDetailDialog(task),
        error: (err) => console.error('Failed to load task', err)
      });
    }
  }

  openTaskDetailDialog(task: any) {
    const dialogRef = this.dialog.open(TaskDetailDialogComponent, {
      width: '400px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/tasks'], {
          queryParams: { refresh: Date.now() },
          state: { shouldRefresh: true }
        });
      }
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.snackBar.open('All notifications marked as read', 'Close', {
          duration: 3000
        });
      },
      error: (err) => console.error('Failed to mark all as read', err)
    });
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId).subscribe({
      error: (err) => console.error('Failed to mark as read', err)
    });
  }

  formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'shortTime') || '';
  }
}
