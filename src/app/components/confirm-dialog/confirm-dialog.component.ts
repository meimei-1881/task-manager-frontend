import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any  // รับข้อมูลจาก Dialog
  ) {}

  onConfirm(): void {
    this.dialogRef.close('confirm');  // ส่งค่ากลับมาเมื่อผู้ใช้ยืนยันการลบ
  }

  onCancel(): void {
    this.dialogRef.close();  // ปิด Dialog โดยไม่ทำการลบ
  }
}
