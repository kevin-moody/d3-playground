import { Component, OnInit } from '@angular/core';

import { HeatMapComponent } from '../heat-map';
import { DataService} from '../data.service';

@Component({
  moduleId: module.id,
  selector: 'app-temperature',
  templateUrl: 'temperature.component.html',
  directives: [HeatMapComponent]
})
export class TemperatureComponent implements OnInit {

  private data:any[];

  constructor(private dataService:DataService) {
    this.dataService.getTemperature()
      .subscribe(data => this.data = data);
  }

  ngOnInit() {
  }

}
