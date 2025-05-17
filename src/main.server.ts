import { enableProdMode } from '@angular/core';
import { platformServer } from '@angular/platform-server';
import { AppServerModule } from './app/app.server.module';  // นำเข้า AppServerModule
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformServer()
  .bootstrapModule(AppServerModule)  // บูตแอปพลิเคชันบนฝั่งเซิร์ฟเวอร์
  .catch((err) => {
    console.error('Error bootstrapping SSR:', err);
  });
