import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {TaskService} from '../../services/task.service';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {TaskDetailDialogComponent} from '../task-detail-dialog/task-detail-dialog.component';
import {ChangeDetectorRef} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {TaskFormComponent} from '../app-task-form/task-form.component';
import {MatButton} from '@angular/material/button';
import {map, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../services/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';

interface Task {
  ID: number;
  name: string;
  status: 'todo' | 'in-progress' | 'completed';
  // เพิ่ม properties อื่นๆ
}

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  imports: [
    CdkDropList,
    NgForOf,
    CdkDrag,
    MatIcon,
    NgClass,
    CommonModule,
    MatButton,
  ],
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: any[] = [];
  private routeSub: Subscription = new Subscription();  // กำหนดค่าเริ่มต้นให้ routeSub

  constructor(private taskService: TaskService, private dialog: MatDialog, private cdr: ChangeDetectorRef, private activatedRoute: ActivatedRoute, private userService: UserService, private snackBar: MatSnackBar,
  ) {
  }

  users: any[] = [];
  userMap: { [id: string]: any } = {};  // กำหนด map ที่ใช้เก็บผู้ใช้ตาม ID

  ngOnInit() {
    // เรียกใช้ฟังก์ชันเพื่อโหลด tasks เมื่อเริ่มต้น
    this.loadTasks();
    this.loadUsers();


    // ตรวจสอบ queryParams เพื่อรีเฟรชข้อมูล
    this.routeSub = this.activatedRoute.queryParams.subscribe(params => {
      if (params['refresh']) {
        this.loadTasks(); // รีเฟรชเมื่อ queryParams เปลี่ยน
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe(); // ทำการยกเลิกการ subscribe เมื่อ component ถูกทำลาย
    }
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(data => {
      this.tasks = data;
    });
  }

  get todoTasks() {
    return this.tasks.filter(task => task.status === 'todo');
  }

  get inProgressTasks() {
    return this.tasks.filter(task => task.status === 'in-progress');
  }

  get completedTasks() {
    return this.tasks.filter(task => task.status === 'completed');
  }

  isCreating = false;

  getAssigneeName(assigneeId: number): string {
    const user = this.users.find(u => u.ID === assigneeId);
    return user ? user.username : 'Unassigned';
  }

  openCreateTaskDialog() {
    this.isCreating = true;
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '4000px'
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        console.log('result', result);

        if (result.action === 'success') { // ตรวจสอบค่าที่ส่งกลับมาจาก dialog
          this.loadTasks();
          this.isCreating = false;
        } else {
          this.isCreating = false;
        }
      }
    });
  }


  openTaskDetailDialog(task: any) {
    console.log(task);
    const dialogRef = this.dialog.open(TaskDetailDialogComponent, {
      width: '400px',
      data: {task: task}  // ส่งข้อมูล Task ไปที่ Dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();  // รีเฟรช Task List เมื่อปิด Dialog
      }
    });
  }

  getTasksByStatus(status: string) {
    return this.tasks.filter(task => task.status === status);
  }

  onTaskDropped(event: CdkDragDrop<any>) {
    // 1. ตรวจสอบข้อมูล event
    console.log('Event container ID:', event.container.id);  // ค่านี้คือ id ของช่องที่เราลากไป
    console.log('Previous container ID:', event.previousContainer.id);

    // 2. ดึง task จากข้อมูลเดิม
    const task: Task = event.item.data;
    console.log('Original task:', JSON.parse(JSON.stringify(task)));

    // 3. ใช้ event.target.id เพื่อกำหนดสถานะใหม่
    const containerId = event.container.id;  // แปลง event.target เป็น HTMLElement เพื่อดึง id
    console.log('Target container ID (containerId):', containerId); // ช่องที่ task ถูกปล่อยไป

    const newStatus = this.mapContainerIdToStatus(containerId);
    console.log('New status:', newStatus);

    // 4. ถ้าสถานะไม่เปลี่ยน ให้ไม่ทำการอัพเดท
    if (task.status === newStatus) {
      console.log('Status is the same, no update required.');
      return;  // ถ้าสถานะเดิมเหมือนสถานะใหม่ ไม่ต้องอัพเดท
    }

    // 5. หากสถานะเป็น null ให้กำหนดสถานะให้ถูกต้องตาม containerId
    if (!newStatus) {
      console.error('Status is null, skipping update.');
      return;  // หลีกเลี่ยงการอัพเดตถ้าสถานะเป็น null
    }

    // 6. สร้าง object ใหม่เพื่อให้ Angular ตรวจพบการเปลี่ยนแปลง
    const updatedTask = {
      ...task,
      status: newStatus
    };

    // 7. อัพเดตใน local array
    const taskIndex = this.tasks.findIndex(t => t.ID === task.ID);
    console.log('Task index:', taskIndex);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = updatedTask;  // อัพเดตใน tasks array ของเรา
    }

    // 8. รีเฟรช UI โดยบังคับให้ Angular ตรวจจับการเปลี่ยนแปลง
    this.cdr.detectChanges();  // Force Angular to detect changes

    // 9. อัพเดตไปยัง backend
    this.taskService.updateTask(updatedTask.ID, updatedTask).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        // อัปเดต local data ใหม่จาก response หากจำเป็น
      },
      error: (err) => {
        console.error('Update failed:', err);
        // ยกเลิกการเปลี่ยนแปลงหากต้องการ
        if (taskIndex !== -1) {
          this.tasks[taskIndex] = task; // ย้อนกลับค่าเดิม
        }
      }
    });
  }

// ฟังก์ชันแปลง container ID เป็น status
  private mapContainerIdToStatus(containerId: string): string | null {
    console.log('mapContainerIdToStatus func Mapping containerId:', containerId);  // ตรวจสอบว่า containerId ถูกต้อง
    const statusMap: { [key: string]: string } = {
      'todo': 'todo',
      'in-progress': 'in-progress',
      'completed': 'completed'
      // เพิ่มสถานะอื่น ๆ ตามต้องการ
    };

    return statusMap[containerId] || null; // คืนค่า null ถ้าไม่มี
  }


  loadUsers(): void {
    this.userService.getUsers().pipe(
      map((users: any[]) => {
        // สร้าง map ของ users โดยใช้ ID
        this.userMap = users.reduce((map, user) => {
          map[user.ID] = user;  // key: user.id, value: user object
          return map;
        }, {});
        console.log('usermap : ', this.userMap)
        return users;
      })
    ).subscribe(
      (users) => {
        this.users = users;  // สามารถใช้ this.users ต่อไปในการแสดงใน UI
      },
      (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Failed to load users', 'Close', {
          duration: 3000
        });
      }
    );
  }

}

