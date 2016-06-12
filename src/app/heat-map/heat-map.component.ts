import { Component, ElementRef, Input, OnInit, OnChanges } from '@angular/core';

import * as d3 from 'd3';

import { Margin } from '../bar-chart/data';

const BASE_TEMPERATURE = 8.66;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'];

@Component({
  moduleId: module.id,
  selector: 'app-heat-map',
  templateUrl: 'heat-map.component.html'
})
export class HeatMapComponent implements OnInit, OnChanges {

  @Input()
  private data:any[];

  @Input()
  private width:number;

  @Input()
  private height:number;

  private aggregatedData:any[];

  private container:d3.Selection<any>;
  private canvas:d3.Selection<any>;
  private chartArea:d3.Selection<any>;
  private chartAreaClip:d3.Selection<any>;
  private chartAreaWidth:number;
  private chartAreaHeight:number;
  private dataArea:d3.Selection<any>;
  private toolTip:d3.Selection<any>;

  private margin:Margin = {
    left: 55,
    right: 40,
    bottom: 30,
    top: 20
  }

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
    this.aggregatedData = this.calculateAverageTemperatures(this.data);
    if (!this.data)
      return;

    // Scaling Y
    let yScale:d3.scale.Linear<number, number> = d3.scale.linear()
      .domain( [12, 0])
      .range([0, this.chartAreaHeight]);

    let yTickValues = [];
    for (let i=1; i<=12; i++)
      yTickValues.push(i - 0.5);
    let yAxis = d3.svg.axis()
        .scale(yScale)
        .tickValues(yTickValues)
        .tickFormat(d => MONTH_NAMES[d - 0.5].substring(0,3).toUpperCase())
        .orient("left");

    // Scaling X
    let years = this.data.map(d => d.year);

    let xScale = d3.scale.linear()
      .domain([d3.min(years), d3.max(years) + 1])
      .range([0, this.chartAreaWidth]);
    let xAxis = d3.svg.axis()
      .scale(xScale)
      .ticks(20)
      .tickFormat(d3.format('d'))
      .orient('bottom')


    let avgTemps = this.aggregatedData.map(d => d.temperature);
    let yScaleAverages = d3.scale.linear()
      .domain([d3.min(avgTemps), d3.max(avgTemps)])
      .range([0, this.chartAreaHeight].reverse())
      .nice();
    let yAxisAverages = d3.svg.axis()
      .scale(yScaleAverages)
      .ticks(20)
      .orient("right");

    let path = "M";
    path += Math.round(xScale(this.aggregatedData[0].year));
    path += ","
    path += Math.round(yScaleAverages(this.aggregatedData[0].temperature));
    for (let i=1; i<this.aggregatedData.length; i++) {
      path += "L"
      path += Math.round(xScale(this.aggregatedData[i].year));
      path += ","
      path += Math.round(yScaleAverages(this.aggregatedData[i].temperature));      
    }


    let variances = this.data.map(d => d.variance);
    let colors = [
      '#d53e4f', '#f46d43', '#fdae61', 
      '#fee08b', '#ffffbf', '#e6f598',
      '#abdda4', '#66c2a5', '#3288bd'
    ];
    let colorScale = d3.scale.quantile()
    .domain([d3.min(variances), d3.max(variances)])
    .range(colors.reverse());
    // console.log(colorScale.quantiles());
    
    // DATA

    let bars = this.dataArea
      .selectAll('rect')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(d.month))
      .attr('width', xScale(2015)-xScale(2014))
      .attr('height', yScale(1)-yScale(2))
      .attr('style', d => 'fill:' + colorScale(d.variance))// + ';stroke:lightgray')
      // tooltips
      .on("mouseover", (datum, index) => {
        this.toolTip.style('visibility', 'visible');
        let temp:number = BASE_TEMPERATURE + datum.variance;
        this.toolTip.html("<b>" + MONTH_NAMES[datum.month-1] + " " + datum.year + "</b><br/>" + temp.toFixed(1) + "&#8451; (" + datum.variance + ")"); 
        let element = this.dataArea.selectAll('rect').filter(d => d == datum)
        let x = +element.attr('x') - 3;
        let y = +element.attr('y');
        y = this.chartAreaHeight - y + 60;
        this.toolTip.style('left', x + "px");
        this.toolTip.style('bottom', y + "px");
      })
      .on("mouseout", (datum) => {
        this.toolTip
          .style('visibility', 'hidden');
      });

    // add line
    this.dataArea.append('path')
      .attr('d', path)
      .attr('stroke', 'lightgray')
      .attr('stroke-width', '5')
      .attr('fill', 'none')
    this.dataArea.append('path')
      .attr('d', path)
      .attr('stroke', 'black')
      .attr('stroke-width', '1')
      .attr('fill', 'none')




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

    // add secondary y-Axis
    this.chartArea
      .append('g')
      .attr("id", "y-axis-secondary")
      .attr("class", "axis y secondary")
      .attr('transform', "translate(" + this.chartAreaWidth + ")")
      .call(yAxisAverages);

  }

  calculateAverageTemperatures(data:any[]):any[] {
    if (!data)
      return null;

    let o:any = {};
    let years = [];
    data.map(d => {
      if (d.year in o) {
        years.push(d.year);
        o[d.year] += d.variance;
      } else
        o[d.year] = d.variance;
    });

    let array = []
    for (var year of years) {
      array.push({
        'year': year,
        'temperature': BASE_TEMPERATURE + o[year]/12
      });
    }
    return array;
  }

}
