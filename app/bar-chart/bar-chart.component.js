"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var d3 = require('d3');
var BarChartComponent = (function () {
    function BarChartComponent(elementRef) {
        this.elementRef = elementRef;
        // private yAxisWidth = 0;
        this.margin = {
            left: 55,
            right: 20,
            bottom: 30,
            top: 20
        };
        this.transitionTime = 500;
        this.container = d3.select(elementRef.nativeElement);
        // window.addEventListener('resize', e => console.log(e)); // tracks the window size!!!
    }
    BarChartComponent.prototype.ngOnInit = function () {
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
    };
    BarChartComponent.prototype.ngOnChanges = function () {
        var _this = this;
        console.log("data changed " + (this.data ? this.data.length : 'null'));
        if (!this.data)
            return;
        // Scaling Y
        var values = this.data.map(function (d) { return d.value; });
        var yScale = d3.scale.linear()
            .domain([0, d3.max(values)])
            .range([0, this.chartAreaHeight].reverse())
            .nice();
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .ticks(10)
            .orient("left");
        // Scaling X
        var dates = this.data.map(function (d) { return d.date; });
        this.xScale = d3.scale.ordinal()
            .domain(dates.map(function (d) { return _this.toQuarter(d); }))
            .rangeBands([0, this.chartAreaWidth], 0.2);
        /* Using ordinal scales, we cannot use the ticks() method to get a desired
           number of ticks; D3 will show all of them. A time scale has the issue that
           our values are ranges, not single dates. Hence, we use a trick to filter
           out quarters until the desired number is reached. We filter all
           Q1s and if we still have too many categories, we half the years until the
           desired maximum is fulfilled.
         */
        var desiredMaximumNumberOfTicks = 20;
        var dateTickValues = dates.map(function (d) { return _this.toQuarter(d); }).filter(function (q) { return q.startsWith("Q1"); });
        while (dateTickValues.length > desiredMaximumNumberOfTicks) {
            dateTickValues = dateTickValues.filter(function (q, idx) { return idx % 2 != 1; });
        }
        var xAxis = d3.svg.axis()
            .scale(this.xScale)
            .tickValues(dateTickValues)
            .tickFormat(function (q) { return q.substr(3); })
            .orient('bottom');
        var bars = this.dataArea
            .selectAll('rect')
            .data(this.data, function (d) { return d.date.toUTCString(); });
        // new values get class 'new'
        bars
            .enter()
            .append('rect')
            .attr('x', function (d) { return _this.xScale(_this.toQuarter(d.date)); })
            .attr('y', yScale(yScale.domain()[0]))
            .attr('width', this.xScale.rangeBand())
            .attr('height', 0)
            .on("mouseover", function (datum, index) {
            _this.toolTip.style('visibility', 'visible');
            _this.toolTip.html(_this.toQuarter(datum.date) + "<br/>" + datum.value + " Billion US$");
            var x = +_this.dataArea.selectAll('rect').filter(function (d) { return d == datum; }).attr('x');
            x = x + _this.xScale.rangeBand() / 2;
            var y = +_this.dataArea.selectAll('rect').filter(function (d) { return d == datum; }).attr('y');
            y = _this.chartAreaHeight - y + 90;
            _this.toolTip.style('left', x + "px");
            _this.toolTip.style('bottom', y + "px");
        })
            .on("mouseout", function (datum) {
            _this.toolTip
                .style('visibility', 'hidden');
        });
        bars
            .transition()
            .duration(this.transitionTime)
            .ease('linear')
            .attr('x', function (d) { return _this.xScale(_this.toQuarter(d.date)); })
            .attr('y', function (d) { return yScale(d.value); })
            .attr('width', this.xScale.rangeBand())
            .attr('height', function (d) { return _this.chartAreaHeight - yScale(d.value); });
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
        var itemsRemoved = bars.exit().size();
        var fadeOutLeft = bars.exit().filter(function (d) { return d.date <= _this.data[0].date; }).size() > 0;
        var newWidthBetweenBars = this.xScale(this.toQuarter(this.data[1].date)) - this.xScale(this.toQuarter(this.data[0].date));
        bars.exit()
            .transition()
            .duration(this.transitionTime)
            .ease('linear')
            .attr('y', function (d) { return yScale(d.value); })
            .attr('height', function (d) { return _this.chartAreaHeight - yScale(d.value); })
            .attr('x', function (d, i) {
            // console.log("removal...data/index:" + d + "/" + i);
            var dateOfMiddleItem = _this.data[Math.round(_this.data.length / 2)].date;
            var dateOfThisItem = d.date;
            // console.log("dates of this/middle: " + dateOfThisItem.toUTCString() + "/" + dateOfMiddleItem.toUTCString())
            // let fadeOutLeft:boolean = dateOfThisItem <= dateOfMiddleItem;
            var moveBars = fadeOutLeft ? -(itemsRemoved - i) : i - _this.data.length + 1;
            // console.log("left?" + fadeOutLeft);
            // console.log("move bars: " + moveBars);
            // console.log("xScale: " + xScale(this.toQuarter(d.date)));
            // console.log("rangeBand: " + xScale.rangeBand());
            var origin = fadeOutLeft ? 0 : _this.chartAreaWidth;
            return origin + moveBars * newWidthBetweenBars;
        })
            .remove();
    };
    BarChartComponent.prototype.ngAfterViewInit = function () {
        console.log("after view init");
        console.log(this.elementRef.nativeElement.parentElement.offsetWidth);
    };
    /**
     * Converts a Javascript Date into a string representation for it's quarter,
     * e.g., the date "1/1/2005"" gets converted to "Q1 2005".
     */
    BarChartComponent.prototype.toQuarter = function (date) {
        var string = "Q";
        string += (date.getUTCMonth() / 3) + 1;
        string += " ";
        string += date.getUTCFullYear();
        return string;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], BarChartComponent.prototype, "data", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], BarChartComponent.prototype, "width", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], BarChartComponent.prototype, "height", void 0);
    BarChartComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'app-bar-chart',
            templateUrl: 'bar-chart.component.html'
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], BarChartComponent);
    return BarChartComponent;
}());
exports.BarChartComponent = BarChartComponent;
//# sourceMappingURL=bar-chart.component.js.map