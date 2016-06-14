import { Component, ElementRef, Input, OnInit, OnChanges, SimpleChange } from '@angular/core';

import * as d3 from 'd3';

import { Margin } from '../bar-chart/data';

@Component({
  moduleId: module.id,
  selector: 'app-reactive-map',
  templateUrl: 'reactive-map.component.html'
})
export class ReactiveMapComponent implements OnInit {

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
  private zoomLayer:d3.Selection<any>;

  private meteorites:d3.Selection<any>;
  private projection:any;

  constructor(private elementRef: ElementRef) {
    this.container = d3.select(elementRef.nativeElement); 
  }


ngOnInit() {
	  this.canvas = this.container.select('#canvas');
    this.zoomLayer = this.container.select("#zoom");
    this.projection = d3.geo.mercator()

    console.log(this.zoomLayer);
  }

  ngOnChanges(changes: {[key: string]: SimpleChange}) {
    console.warn(changes);
    // if (!this.data || !this.map)
    //   return;

    // console.warn('ngOnChanges - data = ' + changes['data'].currentValue);
    // console.warn('ngOnChanges - map = ' + changes['map'].currentValue);

    if (changes['map'] && changes['map'].currentValue) {
      // console.warn("map changed: " + changes["map"])
      // console.warn("DRAWING MAP = THIS SHOULD APPEAR ONLY ONCE")
      let path = d3.geo.path().projection(this.projection);
      let world = this.zoomLayer.select(".map")
        // .append("g")
        // .attr('class', "map")
        .selectAll("path")
        .data(this.map.features.filter(feature => feature.properties.continent != "Antarctica"))
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#a6611a")
        .style("fill", "#fee8c8");
    }

    if (!this.data)
      return;

    console.warn("Number of meteorites: " + this.data.length)

    let radiusScale = d3.scale.pow().exponent(0.4)
      .domain(d3.extent(this.data.map(d=>d.properties.mass)))
      .range([2, 20]);

    this.meteorites = this.zoomLayer.select("#meteorites").selectAll("circle");
    
    this.meteorites
      .data(this.data.filter(feature => feature.geometry!= null))
      .enter()
      .append("circle");
    
    this.meteorites
      .data(this.data.filter(feature => feature.geometry!= null))
		  .attr("cx", d => this.projection(d.geometry.coordinates)[0])
		  .attr("cy", d => this.projection(d.geometry.coordinates)[1])
      .attr("r", 10)
      // .attr("r", d=>radiusScale(d.properties.mass))
      // .attr("opacity", "0.5")
      .style("fill", "darkred")

    this.meteorites
      .data(this.data.filter(feature => feature.geometry!= null))
      .exit()
      .remove()

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
