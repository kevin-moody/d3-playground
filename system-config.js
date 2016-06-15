/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/
/** Map relative paths to URLs. */
var map = {
    "d3": "vendor/d3/d3.js"
};
/** User packages configuration. */
var packages = {
    'd3': {
        format: 'cjs'
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/
var barrels = [
    // Angular specific barrels.
    '@angular/core',
    '@angular/common',
    '@angular/compiler',
    '@angular/http',
    '@angular/router',
    '@angular/platform-browser',
    '@angular/platform-browser-dynamic',
    // Thirdparty barrels.
    'rxjs',
    // App specific barrels.
    'app',
    'app/shared',
    'app/+gdp',
    'app/+test',
    'app/+home',
    'app/header',
    'app/bar-chart',
    'app/+cycling',
    'app/scatterplot-chart',
    'app/+temperature',
    'app/heat-map',
    'app/+countries',
    'app/force-directed-graph',
    'app/+meteorite',
    'app/map',
    'app/+reactive-meteorite',
    'app/reactive-map',
    'app/aggregated-meteorites',
    'app/pipes',
];
var cliSystemConfigPackages = {};
barrels.forEach(function (barrelName) {
    cliSystemConfigPackages[barrelName] = { main: 'index' };
});
// Apply the CLI SystemJS configuration.
System.config({
    map: {
        '@angular': 'vendor/@angular',
        'rxjs': 'vendor/rxjs',
        'main': 'main.js'
    },
    packages: cliSystemConfigPackages
});
// Apply the user's configuration.
System.config({ map: map, packages: packages });
//# sourceMappingURL=system-config.js.map