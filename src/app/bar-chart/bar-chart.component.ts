import { Component, ElementRef, Input, OnInit, OnChanges, AfterViewInit } from '@angular/core';

import * as d3 from 'd3';

@Component({
  moduleId: module.id,
  selector: 'app-bar-chart',
  templateUrl: 'bar-chart.component.html'
})
export class BarChartComponent implements OnInit, OnChanges, AfterViewInit {

  @Input()
  private data:any[];

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

    let chartAreaWidth = this.width - this.margin.left - this.margin.right;
//    let domain = d3.extent(this.data, d => d[1]);

    let chartAreaHeight = this.height - this.margin.top - this.margin.bottom;

    console.log("original: " + this.width + "/" + this.height);
    console.log("chart: " + chartAreaWidth + "/" + chartAreaHeight);

    // Scaling Y
    let yScale:d3.scale.Linear<number, number> = d3.scale.linear()
      .domain([0, d3.max(this.data.map( d => d[1] ) )])
      .range([0, chartAreaHeight].reverse());

    let yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(20)
        .tickFormat(d3.format('s'))
        .orient("left");



    // Scaling X
    let xStrings:string[] = this.data.map(d => d[0]);

    let xScale = d3.scale.ordinal()
      .domain(xStrings)
      .rangeRoundBands([0, chartAreaWidth], 0.2);

    let xAxis = d3.svg.axis()
      .scale(xScale)
      .ticks(10)
      .orient('bottom')


    // Generating chart
	  // let svg = this.container.select('#canvas');

    // let chartArea = svg.append('g')
    //   .attr('class', 'chart')
      // .attr('transform', 'translate(' + this.yAxisWidth + ',0)');


    let bars = this.chartArea
      .selectAll('rect')
      .data(this.data);

    // existing values get class 'updated'
    bars.attr('class', 'updated');

    
    // new values get class 'new'
    bars  
      .enter()
      .append('rect')
      .attr('x', (d, i) => xScale(d[0]))
      .attr('y', yScale(yScale.domain()[0]))
      .attr('width', xScale.rangeBand())
      .attr('height', 0)
      .attr('class', 'new');
    
    bars
      .transition()
      .duration(1000)
      .ease('linear')
      .attr('x', (d, i) => xScale(d[0]))
      .attr('y', d => yScale(d[1]))
      .attr('width', xScale.rangeBand())
      .attr('height', d => chartAreaHeight - yScale(d[1]));

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
}
