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
var common_1 = require('@angular/common');
var Observable_1 = require('rxjs/Observable');
require('rxjs/add/observable/combineLatest');
require('rxjs/add/operator/debounceTime');
var data_service_1 = require('../data.service');
var bar_chart_component_1 = require('../bar-chart/bar-chart.component');
var GdpComponent = (function () {
    function GdpComponent(dataService) {
        this.dataService = dataService;
        this.yearFrom = new common_1.Control();
        this.yearTo = new common_1.Control();
    }
    GdpComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.dataService.getGdpData()
            .subscribe(function (data) {
            // map source format to time series data
            var mapped = data.map(function (single) {
                var typed = {
                    value: single[1],
                    date: new Date(single[0])
                };
                return typed;
            });
            // store data
            _this.data = mapped;
            // DEBUG - we could map the data to percentual changes to the last quarter and offer this as another option...
            // let change = this.data.map(d => d.value).map((value, index, array) => index == 0 ? 0 : value / array[index-1] - 1);
            // console.warn(change);
            // store all years for which we have data
            _this.years = _this.data
                .map(function (tsd) { return tsd.date.getUTCFullYear(); })
                .filter(function (elem, pos, arr) { return arr.indexOf(elem) == pos; });
            // ensure that from <= to in all cases
            _this.yearFrom.valueChanges.subscribe(function (newFrom) {
                if (_this.yearTo.value < newFrom)
                    _this.yearTo.updateValue(newFrom);
            });
            _this.yearTo.valueChanges.subscribe(function (newTo) {
                if (_this.yearFrom.value > newTo)
                    _this.yearFrom.updateValue(newTo);
            });
            // whenever one of the years (from,to) change, update the filtered data
            Observable_1.Observable.combineLatest(_this.yearFrom.valueChanges, _this.yearTo.valueChanges)
                .debounceTime(50)
                .subscribe(function (yearRange) {
                var from = yearRange[0];
                var to = yearRange[1];
                _this.filteredData = _this.data.filter(function (dataPoint) { return dataPoint.date.getUTCFullYear() >= from && dataPoint.date.getUTCFullYear() <= to; });
            });
            // set initial values to first and last available year
            _this.showAllData();
        });
    };
    /**
     * Sets the filters for year from and year to such that all data is shown.
     */
    GdpComponent.prototype.showAllData = function () {
        if (!this.years)
            return;
        this.yearFrom.updateValue(this.years[0]);
        this.yearTo.updateValue(this.years[this.years.length - 1]);
    };
    GdpComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'app-gdp',
            templateUrl: 'gdp.component.html',
            directives: [bar_chart_component_1.BarChartComponent]
        }), 
        __metadata('design:paramtypes', [data_service_1.DataService])
    ], GdpComponent);
    return GdpComponent;
}());
exports.GdpComponent = GdpComponent;
//# sourceMappingURL=gdp.component.js.map