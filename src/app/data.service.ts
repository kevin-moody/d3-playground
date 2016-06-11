import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

  constructor(private http:Http) {}


  getGdpData():Observable<any[]> {
      return this.http.get('GDP-data.json')
        .map(res => res.json())
        .map(data => data.data);
  }

  getCyclingData():Observable<any[]> {
      return this.http.get('cycling-data.json')
        .map(res => res.json());
  }

  getTemperature():Observable<any[]> {
      return this.http.get('temperature.json')
        .map(res => res.json())
        .map(data => data.monthlyVariance);
  }
  
}
