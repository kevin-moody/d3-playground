import { Component, OnInit } from '@angular/core';

import { DataService } from '../data.service';
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { TimeSeriesData } from '../bar-chart/data';

@Component({
  moduleId: module.id,
  selector: 'app-gdp',
  templateUrl: 'gdp.component.html',
  directives: [BarChartComponent]
})
export class GdpComponent implements OnInit {

  private data:TimeSeriesData[];

  constructor(private dataService:DataService) {}

  ngOnInit() {
    this.dataService.getGdpData()
      .subscribe(data => {
        let mapped = data.map(single => {
          let typed:TimeSeriesData = {
            value : single[1],
            date : new Date(single[0])
          }
          return typed;
        });
        this.data=mapped;
        // this.data=mapped.slice(0, 35);
        // console.log(this.data);
        // console.log("***BEGIN")

        // for (let i=0; i<10; i++) {
        //   let date = this.data[i].date;
        //   console.log(date.getUTCMonth() / 3 + 1);
        //   // console.log(date.getUTCDate());
        //   console.log(date.getUTCFullYear());
        // }
        // console.log("***END")

        // setTimeout(() => this.data = this.data.slice(0,50), 2000);
        // setTimeout(() => this.data = this.data.slice(0,10), 4000);
      });
  }

}
