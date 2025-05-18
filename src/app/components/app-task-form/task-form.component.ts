import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import {NgForOf, NgIf} from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {map} from 'rxjs';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  users: any[] = [];
  isEditMode = false;
  currentTask: any;
  isLoading = false; // เพิ่ม state สำหรับการโหลด
  userMap: { [id: string]: any } = {};  // กำหนด map ที่ใช้เก็บผู้ใช้ตาม ID

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private userService: UserService,
    public dialogRef: MatDialogRef<TaskFormComponent>
  ) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      priority: ['medium'],
      assigned_to_id: [],
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    if (this.currentTask) {
      this.taskForm.patchValue({
        name: this.currentTask.name,
        description: this.currentTask.description,
        priority: this.currentTask.priority,
        assignedToID: this.currentTask.assignedToID
      });
    } else {
      const currentUser = this.userService.getCurrentUser();
      this.taskForm.patchValue({
        assignedToID: currentUser?.ID
      });
    }
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

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    console.log('this.taskForm.value.assigned_to_id : ', this.taskForm.value.assigned_to_id)
    if (this.userMap[this.taskForm.value.assigned_to_id] != undefined){
      this.taskForm.value.assigned_to_id = parseInt(this.taskForm.value.assigned_to_id, 10); // ใช้ 10 เป็น base สำหรับการแปลง
      this.taskForm.value.assigned_to = this.userMap[this.taskForm.value.assigned_to_id]
    }

    this.isLoading = true;
      this.taskService.createTask(this.taskForm.value).subscribe({
        next: (newTask) => {
          this.dialogRef.close({
            action: 'success',
            task: newTask,
            isEdit: false
          });
          this.snackBar.open('Task created successfully!', 'Close', {
            duration: 2000
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Error creating task', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }
}
