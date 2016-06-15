import { Component, Input, AfterViewInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import * as d3 from 'd3';

@Component({
  moduleId: module.id,
  selector: 'app-aggregated-meteorites',
  templateUrl: 'aggregated-meteorites.component.html'
})
export class AggregatedMeteoritesComponent implements AfterViewInit {

  @Input()
  private meteorites:Observable<any[]>;

  constructor() {}

  ngAfterViewInit() {
    this.meteorites.subscribe(meteorites => this.createChart(meteorites))
  }

  private createChart(meteorites:any[]) {
    let years = [1800, 2015];//d3.extent(meteorites.map(m => m.properties.year));
    let aggregated:any[] = [];
    for (let i=years[0]; i<years[1]; i++) {
      let meteoritesOfYear = meteorites
        .filter(m => m.properties.year == i)
        .map(m => { 
          return { year:m.properties.year, m: +m.properties.mass/1000000, cnt: 1}
        })
        .reduce((a, b) => {
          // console.log(a);
          // console.log(b);
          let x = { m: a.m + b.m, cnt: a.cnt + b.cnt };
          return x;
        }, {m:0, cnt:0});
      meteoritesOfYear['year'] = i;
      aggregated.push(meteoritesOfYear);
    }
    console.log(aggregated);

    var margin = {top: 20, right: 50, bottom: 50, left: 50},
    width = 300 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;


    var x = d3.scale.linear()
      .domain(years)
      .range([0, width]);

    var y1 = d3.scale.linear()
      .domain(d3.extent(aggregated.map(am => am.cnt)))
      .range([height, 0]);

    var y2 = d3.scale.linear()
      .domain(d3.extent(aggregated.map(am => am.m)))
      .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(d => d)
        .ticks(6)
        .orient("bottom");

    var y1Axis = d3.svg.axis()
        .scale(y1)
        .orient("left");

    var y2Axis = d3.svg.axis()
        .scale(y2)
        .orient("right");

    var area = d3.svg.area<any>()
        .x(d => x(d.year))
        .y0(height)
        .y1(d => y1(d.cnt));

    var path = d3.svg.line<any>()
        .x(d => x(d.year))
        .y(d => y2(d.mass));

    let svg = d3.select('#data1');
    svg.append("path")
        .datum(aggregated)
        .attr("class", "area")
        .attr("d", area);

    svg.append("path")
        .datum(aggregated)
        .attr("class", "line")
        .attr("d", path);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(y1Axis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -35)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("#Meteorites");

    svg.append("g")
        .attr('transform', 'translate(' + width + ',0)')
        .attr("class", "y axis")
        .call(y2Axis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 30)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Weight in tons");

    // TODO: add chart

    console.log(years);
  }

}
