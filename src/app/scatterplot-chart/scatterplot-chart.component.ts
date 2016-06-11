import { Component, ElementRef, Input, OnInit, OnChanges } from '@angular/core';

import * as d3 from 'd3';

import { Margin } from '../bar-chart/data';

@Component({
  moduleId: module.id,
  selector: 'app-scatterplot-chart',
  templateUrl: 'scatterplot-chart.component.html'
})
export class ScatterplotChartComponent implements OnInit, OnChanges {

  @Input()
  private data:any[];

  @Input()
  private width:number;

  @Input()
  private height:number;

  private container:d3.Selection<any>;

  private margin:Margin = {
    left: 55,
    right: 20,
    bottom: 30,
    top: 20
  }

  private canvas:d3.Selection<any>;
  private chartArea:d3.Selection<any>;
  private chartAreaClip:d3.Selection<any>;
  private chartAreaWidth:number;
  private chartAreaHeight:number;

  private dataArea:d3.Selection<any>;

  private transitionTime:number = 500;

  private toolTip:d3.Selection<any>;

  constructor(private elementRef: ElementRef) {
    this.container = d3.select(elementRef.nativeElement); 
  }

  ngOnInit() {
    this.canvas = this.container.select('#canvas');

    this.chartArea = this.canvas.append('g')
      .attr('class', 'chart')
      .attr('transform', 'translate(' + this.margin.left + " " + this.margin.top + ')');

    this.chartAreaWidth = this.width - this.margin.left - this.margin.right;
    this.chartAreaHeight = this.height - this.margin.top - this.margin.bottom;

    this.chartAreaClip = this.canvas.append('defs').append('clipPath')
      .attr("id", "clip")
      .append("rect")
      .attr("x", this.margin.left)
      .attr("y", this.margin.top)
      .attr("width", this.chartAreaWidth)
      .attr("height", this.chartAreaHeight);

    this.dataArea = this.chartArea
      .append('g')
      .attr('id', 'data')
      .attr('clip-path', 'url(#clip)');

    this.toolTip = d3.select("#tooltip");

  }

  ngOnChanges() {
    console.log("data changed " + ( this.data ? this.data.length : 'null'));

    if (!this.data)
      return;

    // Scaling Y
    // let values = this.data.map(d => d.place);

    let places = this.data.map(d => d.place);
    let yScale = d3.scale.linear()
      .domain([d3.min(places), d3.max(places) + 1])
      .range([0, this.chartAreaHeight]);

    let yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");
    
    // Scaling X
    let times = this.data.map(d => d.time);
    let xScale = d3.scale.linear()
      .domain( [d3.min(times), d3.max(times) * 1.05])
      .range([0, this.chartAreaWidth].reverse())
      .nice();

    let xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(10)
        .tickFormat(d => this.formatTime(d))
        .orient("bottom");



    let dots = this.dataArea
      .selectAll('circle')
      .data(this.data)

    dots
      .enter()
      .append('circle')
      .attr('cx', d=>xScale(d.time))
      .attr('cy', d=>yScale(d.place))
      .attr('r', 6)
      .attr('fill', d=>d.doping ? "red" : "green")
      .on("mouseover", (datum, index) => {
        // highlight element 
        let element = this.dataArea.selectAll('circle').filter(d => d == datum);
        element.attr('r', 10);

        // set position
        let x = +element.attr('cx') - 45;
        let y = this.chartAreaHeight - +element.attr('cy') + 100;
        this.toolTip.style('left', x + "px");
        this.toolTip.style('bottom', y + "px");

        // set data and show        
        this.toolTip.html(this.getToolTipHtml(datum));
        this.toolTip.style('visibility', 'visible');
      })
      .on("mouseout", (datum) => {
        let element = this.dataArea.selectAll('circle').filter(d => d == datum);
        element.attr('r', 6);
        this.toolTip.style('visibility', 'hidden');
      });

    // add y-Axis
    this.chartArea.select("#y-axis").remove();
    this.chartArea
      .append('g')
      .attr("id", "y-axis")
      .attr("class", "axis y")
      .call(yAxis);

    // add x-Axis
    this.chartArea.select("#x-axis").remove();
    this.chartArea
      .append('g')
      .attr("id", "x-axis")
      .attr("class", "axis x")
      .attr("transform", "translate(0, " + this.chartAreaHeight + ")")
      .call(xAxis);


  }

  getToolTipHtml(data):string {
    return '<b>' + data.place + ". " + data.name + '</b>, ' + data.nationality + '<br/>' +
    'Year: ' + data.year + "; Time: " + data.totalTime + '<br/>';
    // return JSON.stringify(data);
  }

  formatTime(seconds:number):string {
    let min = Math.floor(seconds/60);
    let sec = seconds % 60;
    let secStr = sec < 10 ? (sec == 0 ? '00' : "0" + sec) : sec.toString();
    return min.toString() + ':' + secStr;
  }
}
