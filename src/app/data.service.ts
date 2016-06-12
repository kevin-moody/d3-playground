import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

  constructor(private http:Http) {}


  getGdpData():Observable<any[]> {
      return this.http.get('data/GDP-data.json')
        .map(res => res.json())
        .map(data => data.data);
  }

  getCyclingData():Observable<any[]> {
      return this.http.get('data/cycling-data.json')
        .map(res => res.json());
  }

  getTemperature():Observable<any[]> {
      return this.http.get('data/temperature.json')
        .map(res => res.json())
        .map(data => data.monthlyVariance);
  }

  getCountries():Observable<any> {
      return this.http.get('data/countries.json')
        .map(res => res.json());
  }

  getMeteorites():Observable<any> {
      return this.http.get('data/meteorites.json')
        .map(res => res.json())
        .map(data => data.features);
  }
  getWorldMap():Observable<any> {
      return this.http.get('data/world.geojson')
        .map(res => res.json());
  }
  
}
