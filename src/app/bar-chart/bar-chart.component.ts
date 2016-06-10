import { Component, ElementRef, Input, OnInit, OnChanges, AfterViewInit } from '@angular/core';

import * as d3 from 'd3';

import { Margin, TimeSeriesData } from './data';

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
  // private yAxisWidth = 0;

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


  private xScale:any;

  constructor(private elementRef: ElementRef) {
    this.container = d3.select(elementRef.nativeElement); 
        // window.addEventListener('resize', e => console.log(e)); // tracks the window size!!!

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
      // .attr('style', "clip-path: url(#clip);");

    this.toolTip = d3.select("#tooltip");
  }

  ngOnChanges() {
    console.log("data changed " + ( this.data ? this.data.length : 'null'));
    if (!this.data)
      return;

    // Scaling Y
    let values = this.data.map(d => d.value);

    let yScale:d3.scale.Linear<number, number> = d3.scale.linear()
      .domain( [0, d3.max(values) ])
      .range([0, this.chartAreaHeight].reverse())
      .nice();

    let yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(10)
        .orient("left");

    // Scaling X
    let dates = this.data.map(d => d.date);

    this.xScale = d3.scale.ordinal()
      .domain(dates.map(d=>this.toQuarter(d)))
      .rangeBands([0, this.chartAreaWidth], 0.2);

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
      .scale(this.xScale)
      .tickValues(dateTickValues)
      .tickFormat(q => q.substr(3))
      .orient('bottom')

    let bars = this.dataArea
      .selectAll('rect')
      .data(this.data, d => d.date.toUTCString());

    // new values get class 'new'
    bars  
      .enter()
      .append('rect')
      .attr('x', d => this.xScale(this.toQuarter(d.date)))
      .attr('y', yScale(yScale.domain()[0]))
      .attr('width', this.xScale.rangeBand())
      .attr('height', 0)
      // tooltips
      .on("mouseover", (datum, index) => {
        this.toolTip.style('visibility', 'visible');
        this.toolTip.html(this.toQuarter(datum.date) + "<br/>" + datum.value + " Billion US$"); 
        let x = +this.dataArea.selectAll('rect').filter(d => d == datum).attr('x') 
        x = x + this.xScale.rangeBand() / 2;
        let y = +this.dataArea.selectAll('rect').filter(d => d == datum).attr('y');
        y = this.chartAreaHeight - y + 90;
        this.toolTip.style('left', x + "px");
        this.toolTip.style('bottom', y + "px");
      })
      .on("mouseout", (datum) => {
        this.toolTip
          .style('visibility', 'hidden');
      });

    
    bars
      .transition()
      .duration(this.transitionTime)
      .ease('linear')
      .attr('x', d => this.xScale(this.toQuarter(d.date)))
      .attr('y', d => yScale(d.value))
      .attr('width', this.xScale.rangeBand())
      .attr('height', d => this.chartAreaHeight - yScale(d.value));

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

    // exit values
    let itemsRemoved = bars.exit().size();
    let fadeOutLeft = bars.exit().filter((d) => d.date <= this.data[0].date).size() > 0;
    let newWidthBetweenBars = this.xScale(this.toQuarter(this.data[1].date)) - this.xScale(this.toQuarter(this.data[0].date));

    bars.exit()
      .transition()
      .duration(this.transitionTime)
      .ease('linear')
      .attr('y', d => yScale(d.value))
      .attr('height', d => this.chartAreaHeight - yScale(d.value))
      .attr('x', (d,i) => {
        // console.log("removal...data/index:" + d + "/" + i);
        let dateOfMiddleItem = this.data[Math.round(this.data.length/2)].date;
        let dateOfThisItem = d.date;
        // console.log("dates of this/middle: " + dateOfThisItem.toUTCString() + "/" + dateOfMiddleItem.toUTCString())
        // let fadeOutLeft:boolean = dateOfThisItem <= dateOfMiddleItem;
        let moveBars = fadeOutLeft ? -(itemsRemoved-i) : i - this.data.length + 1;

        // console.log("left?" + fadeOutLeft);
        // console.log("move bars: " + moveBars);
        // console.log("xScale: " + xScale(this.toQuarter(d.date)));
        // console.log("rangeBand: " + xScale.rangeBand());

        let origin = fadeOutLeft ? 0 : this.chartAreaWidth;
        return origin + moveBars * newWidthBetweenBars;
      }
      )
      .remove();    
  }


  ngAfterViewInit() {
    console.log("after view init")
    console.log(this.elementRef.nativeElement.parentElement.offsetWidth);
   }

   /**
    * Converts a Javascript Date into a string representation for it's quarter,
    * e.g., the date "1/1/2005"" gets converted to "Q1 2005".
    */
   private toQuarter(date:Date):string {
     let string = "Q";
     string += (date.getUTCMonth() / 3) + 1;
     string += " ";
     string += date.getUTCFullYear();
     return string;
   }
}
