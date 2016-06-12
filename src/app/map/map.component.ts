import { Component, ElementRef, Input, OnInit, OnChanges } from '@angular/core';

import * as d3 from 'd3';

import { Margin } from '../bar-chart/data';

@Component({
  moduleId: module.id,
  selector: 'app-map',
  templateUrl: 'map.component.html',
})
export class MapComponent implements OnInit, OnChanges {
  @Input()
  private data:any[];

  @Input()
  private map:any;

  @Input()
  private width:number;

  @Input()
  private height:number;

  private container:d3.Selection<any>;
  private canvas:d3.Selection<any>;
  private chartArea:d3.Selection<any>;
  private chartAreaClip:d3.Selection<any>;
  private chartAreaWidth:number;
  private chartAreaHeight:number;
  private dataArea:d3.Selection<any>;
  private toolTip:d3.Selection<any>;

  private margin:Margin = {
    left: -9,
    right: 0,
    bottom: 0,
    top: 210
  }

  constructor(private elementRef: ElementRef) {
    this.container = d3.select(elementRef.nativeElement); 
  }

  ngOnInit() {
	  this.canvas = this.container.select('#canvas');
    this.canvas
      .append('rect')
      .attr("x", 0).attr("y", 0).attr("width", this.width).attr('height', this.height)
      .style("fill", "rgb(180,215,253)");

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
    if (!this.data || !this.map)
      return;

    let projection = d3.geo.mercator()

    let path = d3.geo.path()
        .projection(projection);
    let world = this.chartArea
      .append("g")
      .attr('class', "map")
      .selectAll("path")
      .data(this.map.features.filter(feature => feature.properties.continent != "Antarctica"))
      .enter()
      .append("path")
      .attr("d", path)
      .style("stroke", "#a6611a")
      .style("fill", "#fee8c8");
    
    // this.data.map(d=>d.properties.mass).forEach(d => console.log(d));
    // let radiusScale = d3.scale.linear()
    //   .domain(d3.extent(this.data.map(d=>d.properties.mass)))
    //   .range([2, 20]);
    let radiusScale = d3.scale.pow().exponent(0.4)
      .domain(d3.extent(this.data.map(d=>d.properties.mass)))
      .range([2, 20]);

    let meteorites = this.chartArea
      .append("g")
      .attr('class', "meteorites")
      .selectAll("circle")
      .data(this.data.filter(feature => feature.geometry!= null))
      .enter()
      .append("circle")
		  .attr("cx", d => projection(d.geometry.coordinates)[0])
		  .attr("cy", d => projection(d.geometry.coordinates)[1])
      // .attr("r", d=>2)
      .attr("r", d=>radiusScale(d.properties.mass))
      .attr("opacity", "0.5")
      .style("fill", "darkred");
  }
}
