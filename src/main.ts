import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { D3PlaygroundAppComponent, environment } from './app/';

if (environment.production) {
  enableProdMode();
}

bootstrap(D3PlaygroundAppComponent);
