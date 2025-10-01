import { Buffer } from 'buffer';
import * as process from 'process';

(window as any).Buffer = Buffer;
(window as any).process = process;

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
