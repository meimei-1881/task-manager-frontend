import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component'; // Standalone Component
// import { AuthInterceptor } from './auth.interceptor'; // AuthInterceptor

@NgModule({
  imports: [
    BrowserModule,  // สำหรับ client-side
    HttpClientModule  // สำหรับทำ HTTP requests
  ],
  providers: [
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthInterceptor,  // ใช้ AuthInterceptor
    //   multi: true  // multi: true ช่วยให้ใช้หลาย Interceptors ได้
    // }
  ],
  bootstrap: []  // ไม่ใช้ bootstrap ที่นี่สำหรับ Standalone Component
})
export class AppModule { }
