import { Component, OnInit } from '@angular/core';

import { DataService } from '../data.service';
import { ScatterplotChartComponent } from '../scatterplot-chart';

@Component({
  moduleId: module.id,
  selector: 'app-cycling',
  templateUrl: 'cycling.component.html',
  directives: [ScatterplotChartComponent]
})
export class CyclingComponent implements OnInit {

  private data:any[];

  constructor(private dataService:DataService) {}

  ngOnInit() {
    this.dataService.getCyclingData()
      .subscribe(data => {
        console.log("data" +data.length);

        let bestTime = data.map(d => d.Seconds).reduce((a, b) => Math.min(a,b));
        console.warn("best time: " + bestTime)
        let mapped = data.map(single => {
          let format = {
            place : single.Place,
            time : single.Seconds - bestTime,
            doping : single.Doping.length > 0,
            name : single.Name,
            year : single.Year,
            nationality : single.Nationality,
            dopingDetails : single.Doping,
            totalTime: single.Time,
            reference : single.URL
          };
          return format;
        });

        this.data = mapped;
      })
  }

}
