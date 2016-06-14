import { Component, OnInit } from '@angular/core';
import { Control } from '@angular/common';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

import { DataService } from '../data.service';


const startingYear = 1800;
const animationSpeed = 3000;
@Component({
  moduleId: module.id,
  selector: 'app-reactive-meteorite',
  templateUrl: 'reactive-meteorite.component.html'
})
export class ReactiveMeteoriteComponent implements OnInit {

  private data:any[];
  private worldMap:any;

  private running:Control;
  private year:Control;

  private allMeteorites:Observable<any[]>;
  private currentYearMeteorites:Observable<any[]>;

  constructor(private dataService:DataService) {
    this.running = new Control(false);
    this.year = new Control(startingYear);

    /** 
     * We take the observable with all meteorites in GeoJSON format, apply
     * transformations to ease later processing of the data and then
     * cache it so we don't need to request all data again every time we switch
     * to a different subset.
     */
    this.allMeteorites = this.dataService.getMeteorites()
      .do(a => console.log(a.length))
      .flatMap(array => Observable.from(array))
      .map(meteorite => {
        let mapped:any = {};
        Object.assign(mapped, meteorite);
        mapped.properties.year = new Date(mapped.properties.year).getUTCFullYear();
        return mapped;
      })
      .toArray()
      .publishReplay(1)
      .refCount()

    /** We declare observables for our controls with a starting value */
    let running$:Observable<boolean> = this.running.valueChanges.startWith(false);
    let year$:Observable<number> = this.year.valueChanges.startWith(startingYear);

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
      .subscribe(x => this.year.updateValue(+this.year.value + 1));

    /**
     * Creating an observable which emits all meteorites of the currently selected year.
     */
    this.currentYearMeteorites = year$.withLatestFrom(this.allMeteorites, (year, meteorites) => {
      return meteorites.filter(m => m.properties.year == year);
    })
  }

  ngOnInit() {
  }

}
