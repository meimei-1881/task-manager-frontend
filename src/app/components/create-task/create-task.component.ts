import { Component } from '@angular/core';
import { TaskService } from '../../services/task.service';
import {FormsModule} from '@angular/forms';  // นำเข้า TaskService ที่ทำงานกับ API

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: ['./create-task.component.css']
})
export class CreateTaskComponent {
  task = {
    name: '',
    description: '',
    status: 'todo'  // สถานะเริ่มต้นของ task
  };

  constructor(private taskService: TaskService) {}

  // ฟังก์ชันเมื่อส่งฟอร์ม
  createTask() {
    this.taskService.createTask(this.task).subscribe(response => {
      console.log('Task created:', response);
    }, error => {
      console.error('Error creating task:', error);
    });
  }
}
