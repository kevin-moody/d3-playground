import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { Http, HTTP_PROVIDERS } from '@angular/http';
import { ROUTER_PROVIDERS } from '@angular/router';

import { D3PlaygroundAppComponent, environment } from './app/';

if (environment.production) {
  enableProdMode();
}

bootstrap(D3PlaygroundAppComponent, [HTTP_PROVIDERS]);
