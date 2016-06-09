import { Component, OnInit } from '@angular/core';
import { Routes , ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'app-test',
  templateUrl: 'test.component.html',
  directives: [ROUTER_DIRECTIVES]
})
export class TestComponent implements OnInit {

  constructor() {}

  ngOnInit() {
  }

}
