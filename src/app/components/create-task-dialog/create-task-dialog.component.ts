import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-create-task-dialog',
  templateUrl: './create-task-dialog.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./create-task-dialog.component.css']
})
export class CreateTaskDialogComponent {
  task = {
    name: '',
    description: '',
    status: 'todo'  // กำหนดสถานะเริ่มต้น
  };

  constructor(private dialogRef: MatDialogRef<CreateTaskDialogComponent>) {}

  createTask() {
    // Logic การส่งข้อมูลไปที่ API หรือ TaskService
    this.dialogRef.close(this.task);  // ปิด dialog และส่งข้อมูลกลับ
  }

  close() {
    this.dialogRef.close();
  }
}
