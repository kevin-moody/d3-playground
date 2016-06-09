import { Component } from '@angular/core';
import { Router, Routes , ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from '@angular/router';

import { DataService } from './data.service';
import { HeaderComponent } from './header';
import { GdpComponent } from './+gdp';
import { HomeComponent } from './+home';
import { TestComponent } from './+test';

@Component({
  moduleId: module.id,
  selector: 'd3-playground-app',
  templateUrl: 'd3-playground.component.html',
  providers: [ROUTER_PROVIDERS, DataService],
  directives: [ROUTER_DIRECTIVES, HeaderComponent]
})
@Routes([
  {path: '/', component: HomeComponent},
  {path: '/gdp', component: GdpComponent},
  {path: '/test', component: TestComponent}
])
export class D3PlaygroundAppComponent {

  constructor (private router:Router) {
  }
}
