import { Component, ElementRef, Input, OnInit, OnChanges } from '@angular/core';

import * as d3 from 'd3';

import { Margin } from '../bar-chart/data';

@Component({
  moduleId: module.id,
  selector: 'app-force-directed-graph',
  templateUrl: 'force-directed-graph.component.html'
})
export class ForceDirectedGraphComponent implements OnInit, OnChanges {

  @Input()
  private nodes:any[];

  @Input()
  private links:any[];

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

  private margin:Margin = {
    left: 20,
    right: 20,
    bottom: 20,
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
  }

  ngOnChanges() {
    if (!this.nodes || !this.links)
      return;

    let force = d3.layout.force()
      .nodes(this.nodes) 
      .links(this.links)
      .charge(-160)
      .linkDistance(50)
      .friction(0.8)
      .size([this.chartAreaWidth, this.chartAreaHeight])
      .start();

  var link = this.dataArea.selectAll(".link")
      .data(this.links)
      .enter().append("line")
      .attr("class", "link")
      .style('stroke', 'lightgray')
      .style("stroke-width", '1');

  var node = this.dataArea.selectAll(".node")
      .data(this.nodes)
      .enter().append('image')
      .attr("xlink:href", d=>'flags/' + d.code + '.png')
      .attr("width", "32px")
      .attr('height', '32px')
      .attr('opacity', 1)
      .call(force.drag);    

    force.on("tick", function() {
      link.attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
      // flat images are 32*32 pixels
      node.attr("x", function(d) { return d.x -16; })
          .attr("y", function(d) { return d.y -16; });
    });
  }

}
