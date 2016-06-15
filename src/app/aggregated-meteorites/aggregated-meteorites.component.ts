import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import * as d3 from 'd3';

@Component({
  moduleId: module.id,
  selector: 'app-aggregated-meteorites',
  templateUrl: 'aggregated-meteorites.component.html'
})
export class AggregatedMeteoritesComponent implements AfterViewInit {

  @Input()
  private meteorites: Observable<any[]>;

  @Input()
  private currentYear: Observable<number>;

  @Output()
  private selectedYear = new EventEmitter<number>();

  private xScale;

  constructor() { }

  ngAfterViewInit() {
    this.meteorites.subscribe(meteorites => this.createChart(meteorites));
    this.currentYear.subscribe(year => this.updateYearIndicator(year));
  }

  private updateYearIndicator(year: number) {
    if (!this.xScale)
      return;

    let trendLine = d3.select("#trendLine");
    if (!year || year < 1800 || year > 2015) {
      trendLine.attr('visibility', 'hidden');
    } else {
      trendLine
        .transition()
        .duration(200)
        .attr('x1', this.xScale(year))
        .attr('x2', this.xScale(year))
        .attr('visibility', 'visible');
    }
  }

  private createChart(meteorites: any[]) {
    let years = [1800, 2015];//d3.extent(meteorites.map(m => m.properties.year));
    let aggregated: any[] = [];
    for (let i = years[0]; i < years[1]; i++) {
      let meteoritesOfYear = meteorites
        .filter(m => m.properties.year == i)
        .map(m => {
          return { year: m.properties.year, m: +m.properties.mass / 1000000, cnt: 1 }
        })
        .reduce((a, b) => {
          let x = { m: a.m + b.m, cnt: a.cnt + b.cnt };
          return x;
        }, { m: 0, cnt: 0 });
      meteoritesOfYear['year'] = i;
      aggregated.push(meteoritesOfYear);
    }

    var margin = { top: 20, right: 50, bottom: 50, left: 50 },
      width = 300 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;


    this.xScale = d3.scale.linear()
      .domain(years)
      .range([0, width]);
    let x = this.xScale;

    let y1 = d3.scale.linear()
      .domain(d3.extent(aggregated.map(am => am.cnt)))
      .range([height, 0]);
    console.log(height);
    let y2 = d3.scale.pow().exponent(0.3)
      .domain(d3.extent(aggregated.map(am => am.m)))
      .nice()
      .range([height, 0]);

    let xAxis = d3.svg.axis()
      .scale(x)
      .tickFormat(d => d)
      .ticks(6)
      .orient("bottom");

    let y1Axis = d3.svg.axis()
      .scale(y1)
      .orient("left");

    let y2Axis = d3.svg.axis()
      .scale(y2)
      .tickValues([20, 10, 5, 2.5, 1, 0.5, 0.2, 0])
      .tickFormat(d => { return d; })
      .orient("right");

    let area = d3.svg.area<any>()
      .x(d => x(d.year))
      .y0(height)
      .y1(d => y1(d.cnt));

    let line = d3.svg.line<any>()
      .x(d => x(d.year))
      .y(d => y2(d.m));


    let svg = d3.select('#data1');
    svg.append("path")
      .datum(aggregated)
      .attr("class", "area")
      .style("fill", 'lightgray')
      .attr("d", area)
      .style("pointer-events", "none");

    svg.append("path")
      .attr("d", line(aggregated))
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .style("pointer-events", "none");

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
      .text("#Meteorites (gray area)");

    svg.append("g")
      .attr('transform', 'translate(' + width + ',0)')
      .attr("class", "y axis")
      .call(y2Axis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 30)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Weight in tons (black line)");

    // use a closure to handle click events on the background
    let sel = this.selectedYear;
    let handleClick = (function () {
      console.log("CLICK")
      let scale = x;
      let events = sel;
      return function (d, i) {
        let coordinates = [0, 0];
        coordinates = d3.mouse(this);
        let x = coordinates[0];
        let inverted = Math.round(scale.invert(x));
        events.emit(inverted);
      }
    })();
    d3.select('#bg').on('click', handleClick);



  }

}
