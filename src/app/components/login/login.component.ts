import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true, // ⚠️ ต้องเป็น true
  templateUrl: './login.component.html',
  imports: [
    NgIf,
    ReactiveFormsModule
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  registeredSuccessfully = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // ตรวจสอบ query parameter สำหรับการแสดงข้อความหลัง register สำเร็จ
    this.route.queryParams.subscribe(params => {
      this.registeredSuccessfully = params['registered'] === 'true';
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.registeredSuccessfully = false;

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        // บันทึก token ลง localStorage
        localStorage.setItem('authToken', response.token);

        // บันทึกข้อมูลผู้ใช้หากมี
        if (response.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }

        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
