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
  private zoomLayer:d3.Selection<any>;
  private chartAreaClip:d3.Selection<any>;
  private chartAreaWidth:number;
  private chartAreaHeight:number;
  private dataArea:d3.Selection<any>;
  private toolTip:d3.Selection<any>;
  private meteorites:d3.Selection<any>;
  private projection:any;
  private margin:Margin = {
    left: -9,
    right: 0,
    bottom: 0,
    top: 210
  }

  // private zoomed = false;

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

    this.zoomLayer = this.chartArea.append('g')
      .attr('class', 'zoom');

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

    this.projection = d3.geo.mercator()

    let path = d3.geo.path()
        .projection(this.projection);
    let world = this.zoomLayer
      .append("g")
      .attr('class', "map")
      .selectAll("path")
      .data(this.map.features.filter(feature => feature.properties.continent != "Antarctica"))
      .enter()
      .append("path")
      .attr("d", path)
      .style("stroke", "#a6611a")
      .style("fill", "#fee8c8");
    
    let radiusScale = d3.scale.pow().exponent(0.4)
      .domain(d3.extent(this.data.map(d=>d.properties.mass)))
      .range([2, 20]);

    this.meteorites = this.zoomLayer
      .append("g")
      .attr('class', "meteorites")
      .selectAll("circle")
    
    this.meteorites
      .data(this.data.filter(feature => feature.geometry!= null))
      .enter()
      .append("circle")
		  .attr("cx", d => this.projection(d.geometry.coordinates)[0])
		  .attr("cy", d => this.projection(d.geometry.coordinates)[1])
      .attr("r", d=>radiusScale(d.properties.mass))
      .attr("opacity", "0.5")
      .style("fill", "darkred")

      // add tooltips
      .on("mouseenter", (datum, index) => {
        this.toolTip.style('visibility', 'visible');
        this.toolTip.html("<b>" + datum.properties.name + "</b><br/>Year: " + datum.properties.year + "<br>" + this.getWeight(datum.properties.mass) + "<br>Class: " + datum.properties.recclass.substring(0,10)); 
        let x = this.projection(datum.geometry.coordinates)[0] - 69;
        let y = this.chartAreaHeight - this.projection(datum.geometry.coordinates)[1] + 90;
        this.toolTip.style('left', x + "px");
        this.toolTip.style('bottom', y + "px");
      })
      .on("mouseleave", (datum) => {
        this.toolTip
          .style('visibility', 'hidden');
      });
    // setTimeout(() => this.handleZoomClick(), 3000);
    // setTimeout(() => this.handleZoomClick(), 6000);
  }

  // handleZoomClick() {
  //   let scale:number;
  //   let center:string;
  //   if (this.zoomed) {
  //     center = '0 0';
  //     scale = 1;
  //   } else {
  //     center = "-300 -300";
  //     scale = 4;
  //   }
  //   this.zoomed = !this.zoomed;
  //   this.zoomLayer
  //     .transition()
  //     .duration(750)
  //     .attr('transform', 'translate(' + center + ') scale('+ scale + ')');
  // }

  getWeight(weight:number):string {
    if (weight == 0)
      return "Unknown weight";
    
    if (weight < 1000)
      return "Weight: " + weight + "g";
    
    if (weight < 1000000)
      return "Weight: " + (weight/1000).toFixed(1) + "kg";
    
    return "Weight: " + (weight/1000000).toFixed(1) + "t";
  }
}
