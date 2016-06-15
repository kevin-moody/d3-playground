import { Component, OnInit } from '@angular/core';
import { Control } from '@angular/common';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

import { DataService } from '../data.service';
import { ReactiveMapComponent } from '../reactive-map';
import { AggregatedMeteoritesComponent } from '../aggregated-meteorites';
import { NaPipe, WeightPipe } from '../pipes';

const STARTING_YEAR = 1800;
const END_YEAR = 2015;
const ANIMATION_SPEED = 200;

@Component({
  moduleId: module.id,
  selector: 'app-reactive-meteorite',
  templateUrl: 'reactive-meteorite.component.html',
  directives: [ReactiveMapComponent, AggregatedMeteoritesComponent],
  pipes: [NaPipe, WeightPipe]
})
export class ReactiveMeteoriteComponent implements OnInit {

  // redeclaring constants so they can be used in the view
  private startingYear = STARTING_YEAR;
  private endYear = END_YEAR;

  // controls
  private runningControl:Control;
  private yearControl:Control;
  private loopControl:Control;

  // observables for all data
  private year:Observable<number>;
  private allMeteorites:Observable<any[]>;
  private currentYearMeteorites:Observable<any[]>;

  constructor(private dataService:DataService) {
    this.runningControl = new Control(false);
    this.yearControl = new Control(STARTING_YEAR);
    this.loopControl = new Control(true);
  }

  ngOnInit() {
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
      .filter(m => m.properties.year >= STARTING_YEAR)
      .toArray()
      .publishReplay(1)
      .refCount()

    /** We declare observables for our controls with a starting value */
    let running$:Observable<boolean> = this.runningControl.valueChanges.startWith(false);
    this.year = this.yearControl.valueChanges.startWith(STARTING_YEAR);

    /**
     * The timer emits an event according to our aninmation speed, but only
     * if the animation is in 'running' state. For every emit, we change the
     * current year.
     */
    let timer$ = Observable.combineLatest(
        running$,
        Observable.interval(ANIMATION_SPEED),
        (running, tick) => running ? 1 : 0
      )
      .filter(tick => tick == 1)
      .subscribe(x => {
        let nextYear = +this.yearControl.value + 1;
        if (nextYear > END_YEAR) {
          if (this.loopControl.value)
            this.changeYear(STARTING_YEAR);
          else
            this.runningControl.updateValue(false);
        } else {
          this.changeYear(nextYear);
        }
      });

    /**
     * Creating an observable which emits all meteorites of the currently selected year.
     */
    this.currentYearMeteorites = this.year.withLatestFrom(this.allMeteorites, (year, meteorites) => {
      return meteorites.filter(m => m.properties.year == year);
    })
    .startWith([]);
  }

  changeYear(newYear:number) {
    this.yearControl.updateValue(newYear);
  }

}
