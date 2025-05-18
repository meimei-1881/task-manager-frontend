import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf,
    RouterLink
  ],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.registerForm.value;

    this.authService.register(username, password).subscribe({
      next: (response) => {
        console.log('response', response);
        // Assuming your backend returns a token upon successful registration
        if (response.token) {
          // Store the token (in localStorage, cookies, or service)
          localStorage.setItem('authToken', response.token);

          // Redirect to /tasks page
          // this.router.navigate(['/tasks']);
        } else {
          console.log('to login')
          // If no token returned, redirect to login with success message
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true' }
          });
        }
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Registration failed';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
