import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';  // นำเข้า MatDialog
import { TaskService } from '../../services/task.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import {FormsModule} from '@angular/forms';  // นำเข้า ConfirmDialog

@Component({
  selector: 'app-task-detail-dialog',
  templateUrl: './task-detail-dialog.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./task-detail-dialog.component.css']
})
export class TaskDetailDialogComponent {
  task: any;

  constructor(
    private dialogRef: MatDialogRef<TaskDetailDialogComponent>,
    private taskService: TaskService,
    private dialog: MatDialog,  // นำเข้า MatDialog
    @Inject(MAT_DIALOG_DATA) public data: any // รับข้อมูลจาก Dialog
  ) {
    this.task = { ...data.task };  // ทำสำเนาข้อมูล Task ที่ถูกคลิก
  }

  // ฟังก์ชันสำหรับอัพเดตสถานะและข้อมูลของ Task
  updateTask() {
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
      data: { task: this.task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.deleteTask();  // หากผู้ใช้ยืนยันการลบ
      }
    });
  }

  // ฟังก์ชันสำหรับลบ Task
  deleteTask() {
    this.taskService.deleteTask(this.task.id).subscribe(
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
}
