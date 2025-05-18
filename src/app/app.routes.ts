// src/app/app.routes.ts
import { Routes } from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {TaskListComponent} from './components/task-list/task-list.component';
import { AuthGuard } from './components/guards/auth.guard';
import {RegisterComponent} from './components/register/register.component';  // นำเข้า AuthGuard


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'tasks', component: TaskListComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
