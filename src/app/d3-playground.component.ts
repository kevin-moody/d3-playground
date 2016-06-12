import { Component } from '@angular/core';
import { Router, Routes , ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from '@angular/router';
import { MeteoriteComponent } from './+meteorite';

import { DataService } from './data.service';
import { HeaderComponent } from './header';
import { HomeComponent } from './+home';

import { GdpComponent } from './+gdp';
import { CyclingComponent } from './+cycling';
import { TemperatureComponent } from './+temperature';
import { CountriesComponent } from './+countries';

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
  {path: '/test', component: TestComponent},
  {path: '/cycling', component: CyclingComponent},
  {path: '/temperature', component: TemperatureComponent},
  {path: '/countries', component: CountriesComponent},
  {path: '/meteorite', component: MeteoriteComponent}
])
export class D3PlaygroundAppComponent {

  constructor (private router:Router) {
  }
}
