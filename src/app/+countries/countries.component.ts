import { Component, OnInit } from '@angular/core';

import { DataService } from '../data.service';
import { ForceDirectedGraphComponent } from '../force-directed-graph';

@Component({
  moduleId: module.id,
  selector: 'app-states',
  templateUrl: 'countries.component.html',
  directives: [ForceDirectedGraphComponent]
})
export class CountriesComponent implements OnInit {

  private links:any[];
  private nodes:any[];

  constructor(private dataService:DataService) {
    this.dataService.getCountries().subscribe(data => {
      this.nodes = data.nodes;
      this.links = data.links;
    });
  }

  ngOnInit() {
  }

}
