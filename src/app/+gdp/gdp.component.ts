import { Component, OnInit } from '@angular/core';
import { Control } from '@angular/common';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/debounceTime';

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

  // all years for which data is available
  private years:number[];
  // user-selected filters
  private yearFrom:Control;
  private yearTo:Control;

  // all available data
  private data:TimeSeriesData[];
  // data filtered by user-selected years
  private filteredData:TimeSeriesData[];

  constructor(private dataService:DataService) {
    this.yearFrom = new Control();
    this.yearTo = new Control();
  }

  ngOnInit() {
    this.dataService.getGdpData()
      .subscribe(data => {

        // map source format to time series data
        let mapped = data.map(single => {
          let typed:TimeSeriesData = {
            value : single[1],
            date : new Date(single[0])
          }
          return typed;
        });

        // store data
        this.data = mapped;


        // DEBUG - we could map the data to percentual changes to the last quarter and offer this as another option...
        // let change = this.data.map(d => d.value).map((value, index, array) => index == 0 ? 0 : value / array[index-1] - 1);
        // console.warn(change);


        // store all years for which we have data
        this.years = this.data
          .map(tsd => tsd.date.getUTCFullYear())
          .filter((elem, pos, arr) => arr.indexOf(elem) == pos);

        // ensure that from <= to in all cases
        this.yearFrom.valueChanges.subscribe(newFrom => {
          if (this.yearTo.value < newFrom)
            this.yearTo.updateValue(newFrom);
        });
        this.yearTo.valueChanges.subscribe(newTo => {
          if (this.yearFrom.value > newTo)
            this.yearFrom.updateValue(newTo);
        });
        
        // whenever one of the years (from,to) change, update the filtered data
        Observable.combineLatest(this.yearFrom.valueChanges, this.yearTo.valueChanges)
          .debounceTime(50)
          .subscribe(yearRange => {
            let from:number = yearRange[0];
            let to:number = yearRange[1];
            this.filteredData = this.data.filter(dataPoint => dataPoint.date.getUTCFullYear() >= from && dataPoint.date.getUTCFullYear() <= to);
          });

        // set initial values to first and last available year
        this.showAllData();
      });
  }

  /**
   * Sets the filters for year from and year to such that all data is shown.
   */
  showAllData() {
    if (!this.years)
      return;
    
    this.yearFrom.updateValue(this.years[0]);
    this.yearTo.updateValue(this.years[this.years.length-1]);
  }

}
