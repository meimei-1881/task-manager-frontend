import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppComponent } from './app.component';  // Standalone Component

@NgModule({
  imports: [
    ServerModule  // ใช้ ServerModule สำหรับ SSR
  ],
  bootstrap: []  // ไม่ใช้ bootstrap ที่นี่สำหรับ Standalone Component
})
export class AppServerModule {}
