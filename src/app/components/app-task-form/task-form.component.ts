import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  imports: [
    ReactiveFormsModule,
    NgForOf
  ],
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  users: any[] = [];
  isEditMode = false;
  currentTask: any;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private userService: UserService
  ) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      priority: ['medium'],
      assignedToID: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();

    // If editing an existing task
    if (this.currentTask) {
      this.taskForm.patchValue({
        name: this.currentTask.name,
        description: this.currentTask.description,
        priority: this.currentTask.priority,
        assignedToID: this.currentTask.assignedToID
      });
    } else {
      // Default to current user if creating new task
      const currentUser = this.userService.getCurrentUser();
      this.taskForm.patchValue({
        assignedToID: currentUser?.ID
      });
    }
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (users) => {
        this.users = users;
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const taskData = {
        ...this.taskForm.value,
        status: 'todo', // Default status
        createdByID: this.userService.getCurrentUser().ID
      };

      if (this.isEditMode) {
        this.taskService.updateTask(this.currentTask.ID, taskData).subscribe(
          (response) => {
            console.log('Task updated:', response);
          },
          (error) => {
            console.error('Update error:', error);
          }
        );
      } else {
        this.taskService.createTask(taskData).subscribe(
          (response) => {
            console.log('Task created:', response);
          },
          (error) => {
            console.error('Creation error:', error);
          }
        );
      }
    }
  }
}
