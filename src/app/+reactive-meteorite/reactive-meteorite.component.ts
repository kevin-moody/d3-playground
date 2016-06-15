import { Component, OnInit } from '@angular/core';
import { Control } from '@angular/common';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

import { DataService } from '../data.service';
import { ReactiveMapComponent } from '../reactive-map';
import { AggregatedMeteoritesComponent } from '../aggregated-meteorites';
import { Weight } from '../weight.pipe';
import { Na } from '../na.pipe';

const startingYear = 1800;
const animationSpeed = 200;
@Component({
  moduleId: module.id,
  selector: 'app-reactive-meteorite',
  templateUrl: 'reactive-meteorite.component.html',
  directives: [ReactiveMapComponent, AggregatedMeteoritesComponent],
  pipes: [Weight, Na]
})
export class ReactiveMeteoriteComponent implements OnInit {

  private data:any[];
  private worldMap:any;

  private runningControl:Control;
  private yearControl:Control;

  private year:Observable<number>;
  private allMeteorites:Observable<any[]>;
  private currentYearMeteorites:Observable<any[]>;

  constructor(private dataService:DataService) {
    this.dataService.getWorldMap().subscribe(data => this.worldMap = data);
    this.runningControl = new Control(false);
    this.yearControl = new Control(startingYear);

    /** 
     * We take the observable with all meteorites in GeoJSON format, apply
     * transformations to ease later processing of the data and then
     * cache it so we don't need to request all data again every time we switch
     * to a different subset.
     */
    this.allMeteorites = this.dataService.getMeteorites()
      .flatMap(array => Observable.from(array))
      .map(meteorite => {
        let mapped:any = {};
        Object.assign(mapped, meteorite);
        mapped.properties.year = new Date(mapped.properties.year).getUTCFullYear();
        return mapped;
      })
      .filter(m => m.properties.year >= 1800)
      .toArray()
      .publishReplay(1)
      .refCount()

    /** We declare observables for our controls with a starting value */
    let running$:Observable<boolean> = this.runningControl.valueChanges.startWith(false);
    this.year = this.yearControl.valueChanges.startWith(startingYear);

    /**
     * The timer emits an event according to our aninmation speed, but only
     * if the animation is in 'running' state. For every emit, we change the
     * current year.
     */
    let timer$ = Observable.combineLatest(
        running$,
        Observable.interval(animationSpeed),
        (running, tick) => running ? 1 : 0
      )
      .filter(tick => tick == 1)
      .subscribe(x => {
        let nextYear = +this.yearControl.value + 1;
        if (nextYear > 2015)
          this.runningControl.updateValue(false);
        else
          this.yearControl.updateValue(nextYear)
      });

    /**
     * Creating an observable which emits all meteorites of the currently selected year.
     */
    this.currentYearMeteorites = this.year.withLatestFrom(this.allMeteorites, (year, meteorites) => {
      return meteorites.filter(m => m.properties.year == year);
    })
    .startWith([]);
  }

  ngOnInit() {
  }

}
