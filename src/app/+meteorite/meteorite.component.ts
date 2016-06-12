import { Component, OnInit } from '@angular/core';

import { DataService } from '../data.service';
import { MapComponent } from '../map';

@Component({
  moduleId: module.id,
  selector: 'app-meteorite',
  templateUrl: 'meteorite.component.html',
  directives: [MapComponent]
})
export class MeteoriteComponent implements OnInit {

  private data:any[];
  private worldMap:any;

  constructor(private dataService:DataService) {
    this.dataService.getMeteorites().subscribe(data => { 
      this.data = data
        .filter(d => d.properties.year != null)
        .map(d => {
          // cast strings to number
          d.properties.mass = +d.properties.mass;
          d.properties.year = +d.properties.year.substring(0,4);
          return d;
        })
        .sort((a,b)=> a.properties.year - b.properties.year);
    });
    this.dataService.getWorldMap().subscribe(data => this.worldMap = data);
  }

  ngOnInit() {
  }

}
