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
var router_1 = require('@angular/router');
var data_service_1 = require('./data.service');
var header_1 = require('./header');
var _gdp_1 = require('./+gdp');
var _home_1 = require('./+home');
var _test_1 = require('./+test');
var D3PlaygroundAppComponent = (function () {
    function D3PlaygroundAppComponent(router) {
        this.router = router;
    }
    D3PlaygroundAppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'd3-playground-app',
            templateUrl: 'd3-playground.component.html',
            providers: [router_1.ROUTER_PROVIDERS, data_service_1.DataService],
            directives: [router_1.ROUTER_DIRECTIVES, header_1.HeaderComponent]
        }),
        router_1.Routes([
            { path: '/', component: _home_1.HomeComponent },
            { path: '/gdp', component: _gdp_1.GdpComponent },
            { path: '/test', component: _test_1.TestComponent }
        ]), 
        __metadata('design:paramtypes', [router_1.Router])
    ], D3PlaygroundAppComponent);
    return D3PlaygroundAppComponent;
}());
exports.D3PlaygroundAppComponent = D3PlaygroundAppComponent;
//# sourceMappingURL=d3-playground.component.js.map