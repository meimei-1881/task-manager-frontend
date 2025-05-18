import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog} from '@angular/material/dialog';  // นำเข้า MatDialog
import {TaskService} from '../../services/task.service';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
import {UserService} from '../../services/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {map} from 'rxjs';  // นำเข้า ConfirmDialog

@Component({
  selector: 'app-task-detail-dialog',
  templateUrl: './task-detail-dialog.component.html',
  imports: [
    FormsModule,
    NgForOf
  ],
  styleUrls: ['./task-detail-dialog.component.css']
})
export class TaskDetailDialogComponent {
  task: any;
  users: any[] = [];
  userMap: { [id: string]: any } = {};  // กำหนด map ที่ใช้เก็บผู้ใช้ตาม ID


  constructor(
    private dialogRef: MatDialogRef<TaskDetailDialogComponent>,
    private taskService: TaskService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,  // นำเข้า MatDialog
    @Inject(MAT_DIALOG_DATA) public data: any // รับข้อมูลจาก Dialog
  ) {
    this.task = {...data.task};  // ทำสำเนาข้อมูล Task ที่ถูกคลิก
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  // ฟังก์ชันสำหรับอัพเดตสถานะและข้อมูลของ Task
  updateTask() {

    if (this.userMap[this.task.assigned_to_id] != undefined){
      this.task.assigned_to_id = parseInt(this.task.assigned_to_id, 10); // ใช้ 10 เป็น base สำหรับการแปลง
      this.task.assigned_to = this.userMap[this.task.assigned_to_id]
    }
    this.taskService.updateTask(this.task.ID, this.task).subscribe(
      (response) => {
        console.log('Task updated:', response);
        this.dialogRef.close(this.task);  // ปิด dialog และส่งข้อมูลกลับ
      },
      (error) => {
        console.error('Error updating task:', error);
      }
    );
  }

  // ฟังก์ชันปิด Dialog
  close() {
    this.dialogRef.close();
  }

  // ฟังก์ชันเปิด Confirm Dialog ก่อนลบ Task
  openConfirmDialog() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {task: this.task}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.deleteTask();  // หากผู้ใช้ยืนยันการลบ
      }
    });
  }

  // ฟังก์ชันสำหรับลบ Task
  deleteTask() {
    this.taskService.deleteTask(this.task.ID).subscribe(
      (response) => {
        console.log('Task deleted:', response);
        this.dialogRef.close();  // ปิด Dialog เมื่อ Task ถูกลบ
        this.reloadPage();  // รีโหลดหน้าลิสต์
      },
      (error) => {
        console.error('Error deleting task:', error);
      }
    );
  }

  // ฟังก์ชันรีเฟรช Task List ในหน้า Task List
  reloadPage() {
    // ส่งสัญญาณให้ TaskListComponent รีเฟรชข้อมูล
    this.dialogRef.close('reload');  // ส่งค่า 'reload' กลับไปยัง TaskListComponent
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
