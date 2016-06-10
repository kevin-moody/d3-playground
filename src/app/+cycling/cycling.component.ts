import { Component, OnInit } from '@angular/core';

import { DataService } from '../data.service';

@Component({
  moduleId: module.id,
  selector: 'app-cycling',
  templateUrl: 'cycling.component.html'
})
export class CyclingComponent implements OnInit {

  private data:any[];

  constructor(private dataService:DataService) {}

  ngOnInit() {
    this.dataService.getCyclingData()
      .subscribe(data => {
        console.log("data" +data.length);
        let mapped = data.map(single => {
          let format = {
            place : single.Place,
            time : single.Seconds,
            doping : single.Doping.length > 0,
            name : single.Name,
            year : single.Year,
            nationality : single.Nationality,
            dopingDetails : single.Doping,
            reference : single.URL
          };
          return format;
        });

        this.data = mapped;
      })
  }

}
