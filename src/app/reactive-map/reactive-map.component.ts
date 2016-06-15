import { Component, ElementRef, Input, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as d3 from 'd3';
import {DataService } from '../data.service';

@Component({
  moduleId: module.id,
  selector: 'app-reactive-map',
  templateUrl: 'reactive-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReactiveMapComponent implements AfterViewInit {

  @Input()
  private data:Observable<any[]>;

  @Input()
  private width:number;

  @Input()
  private height:number;

  private container:d3.Selection<any>;
  private zoomLayer:d3.Selection<any>;

  private meteorites:d3.Selection<any>;

  private projection = d3.geo.mercator();
  private radiusScale = d3.scale.pow().exponent(0.4)
      .domain([0, 20000000])
      .range([4, 30]);


  constructor(private elementRef: ElementRef, private dataService:DataService) {
    this.container = d3.select(this.elementRef.nativeElement); 
  }

  ngAfterViewInit() {
    this.zoomLayer = this.container.select("#zoom");

    // subscribe to map/meteorite data
    this.dataService.getWorldMap().subscribe(m => this.updateMap(m));
    this.data.subscribe(data => this.updateMeteorites(data));
  }

  private updateMeteorites(data:any[]) {
    this.zoomLayer.select("#meteorites")
      .selectAll("circle")
      .transition()
      .duration(250)
      .attr('opacity', 0)
      .remove();
    
    this.meteorites = this.zoomLayer.select("#meteorites").selectAll('#NONEXISTANT');
    
    this.meteorites
      .data(data.filter(feature => feature.geometry!= null))
      .enter()
      .append("circle")
      .attr("cx", d => this.projection(d.geometry.coordinates)[0])
		  .attr("cy", d => this.projection(d.geometry.coordinates)[1])
      .attr("r", d=>this.radiusScale(d.properties.mass)*2)
      .attr("opacity", "1")
      .style("fill", "darkred")
      .transition()
      .duration(1000)
		  // .attr("cx", d => this.projection(d.geometry.coordinates)[0])
		  // .attr("cy", d => this.projection(d.geometry.coordinates)[1])
      .attr("r", d=>this.radiusScale(d.properties.mass))
      .attr("opacity", "1")
      .style("fill", "darkred");    
  }

  private updateMap(mapData) {
      let path = d3.geo.path().projection(this.projection);
      this.zoomLayer.select("#map")
        .selectAll("path")
        .data(mapData.features.filter(feature => feature.properties.continent != "Antarctica"))
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#a6611a")
        .style("fill", "#fee8c8");
  }
}
