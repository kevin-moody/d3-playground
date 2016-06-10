import { Component, ElementRef, Input, OnInit, OnChanges, AfterViewInit } from '@angular/core';

import * as d3 from 'd3';

import { TimeSeriesData } from './data';

@Component({
  moduleId: module.id,
  selector: 'app-bar-chart',
  templateUrl: 'bar-chart.component.html'
})
export class BarChartComponent implements OnInit, OnChanges, AfterViewInit {

  @Input()
  private data:TimeSeriesData[];

  @Input()
  private width:number;

  @Input()
  private height:number;

  private container:d3.Selection<any>;
  private yAxisWidth = 0;

  private margin = {
    left: 50,
    right: 50,
    bottom: 50,
    top: 50
  }

  private canvas:d3.Selection<any>;
  private chartArea:d3.Selection<any>;

  constructor(private elementRef: ElementRef) {
    // console.log(this.elementRef.nativeElement.parentElement);
    this.container = d3.select(elementRef.nativeElement); 
        // window.addEventListener('resize', e => console.log(e)); // tracks the window size!!!

  }

  ngOnInit() {
	  this.canvas = this.container.select('#canvas');

    this.chartArea = this.canvas.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + this.margin.left + " " + this.margin.top + ')')
  }

  ngOnChanges() {
    console.log("data changed " + ( this.data ? this.data.length : 'null'));
    if (!this.data)
      return;

    // Calculating chart area dimensions
    let chartAreaWidth = this.width - this.margin.left - this.margin.right;
    let chartAreaHeight = this.height - this.margin.top - this.margin.bottom;

    // Scaling Y
    let values = this.data.map(d => d.value);

    let yScale:d3.scale.Linear<number, number> = d3.scale.linear()
      .domain( [0, d3.max(values) ])
      .range([0, chartAreaHeight].reverse());

    let yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(20)
        .tickFormat(d3.format('s'))
        .orient("left");

    // Scaling X
    let dates = this.data.map(d => d.date);

    let xScale = d3.scale.ordinal()
      .domain(dates.map(d=>this.toQuarter(d)))
      .rangeBands([0, chartAreaWidth], 0.2);

    /* Using ordinal scales, we cannot use the ticks() method to get a desired
       number of ticks; D3 will show all of them. A time scale has the issue that
       our values are ranges, not single dates. Hence, we use a trick to filter
       out quarters until the desired number is reached. We filter all
       Q1s and if we still have too many categories, we half the years until the 
       desired maximum is fulfilled.
     */
    let desiredMaximumNumberOfTicks = 20;
    let dateTickValues = dates.map(d=>this.toQuarter(d)).filter(q => q.startsWith("Q1"));
    while (dateTickValues.length > desiredMaximumNumberOfTicks) {
      dateTickValues = dateTickValues.filter((q, idx) => idx % 2 != 1);
    }

    let xAxis = d3.svg.axis()
      .scale(xScale)
      .tickValues(dateTickValues)
      .tickFormat(q => q.substr(3))
      .orient('bottom')


    let bars = this.chartArea
      .selectAll('rect')
      .data(this.data);

    // existing values get class 'updated'
    bars.attr('class', 'updated');

    
    // new values get class 'new'
    bars  
      .enter()
      .append('rect')
      .attr('x', d => xScale(this.toQuarter(d.date)))
      .attr('y', yScale(yScale.domain()[0]))
      .attr('width', xScale.rangeBand())
      .attr('height', 0)
      .attr('class', 'new');
    
    bars
      .transition()
      .duration(1000)
      .ease('linear')
      .attr('x', d => xScale(this.toQuarter(d.date)))
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.rangeBand())
      .attr('height', d => chartAreaHeight - yScale(d.value));

    // add y-Axis
    this.chartArea.select("#y-axis").remove();
    this.chartArea
      .append('g')
      .attr("id", "y-axis")
      .attr("class", "axis y")
      .call(yAxis);

    this.chartArea.select("#x-axis").remove();
    this.chartArea
      .append('g')
      .attr("id", "x-axis")
      .attr("class", "axis x")
      .attr("transform", "translate(0, " + chartAreaHeight + ")")
      .call(xAxis);

    // exit values
    bars.exit().remove();    
  }


  ngAfterViewInit() {
    console.log("after view init")
    console.log(this.elementRef.nativeElement.parentElement.offsetWidth);
   }

   private toQuarter(date:Date):string {
     let string = "Q";
     string += (date.getUTCMonth() / 3) + 1;
     string += " ";
     string += date.getUTCFullYear();
     return string;
   }
}
