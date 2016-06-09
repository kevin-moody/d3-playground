import { Component, OnInit } from '@angular/core';

import { DataService } from '../data.service';
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { SingleDimensionalData } from '../bar-chart/data';

@Component({
  moduleId: module.id,
  selector: 'app-gdp',
  templateUrl: 'gdp.component.html',
  directives: [BarChartComponent]
})
export class GdpComponent implements OnInit {

  private data:any[];
  private typedData:SingleDimensionalData;
  
  constructor(private dataService:DataService) {}

  ngOnInit() {
    this.dataService.getGdpData()
      .subscribe(data => {
        let formated:SingleDimensionalData = {
          x: data.map(d=>d[1]),
          labels: data.map(d=>d[0].substring(0, 7))
        };
        this.typedData = formated;
        this.data=data.slice(0, 35);
        setTimeout(() => this.data = data.slice(0,14), 2000);
      });
  }

}
