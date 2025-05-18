import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private http: HttpClient) {}

  private apiUrl = `${environment.apiBaseUrlAPI}/tasks`;



  getTasks(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getTask(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createTask(task: any): Observable<any> {
    return this.http.post(this.apiUrl, task);
  }

  updateTask(id: any, task: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
