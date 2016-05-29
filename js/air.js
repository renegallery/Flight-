// Global variables and objects
var airProjection;
var airPath;
var airVoronoi;
var airSvg;

function pageIsLoaded() {
	// Display airline map
	doAirmap();
}

function doAirmap () {
	var width = 960,
		height = 500;

	airProjection = d3.geo.albers()
		.translate([width / 2, height / 2])
		.scale(1080);

	airPath = d3.geo.path()
		.projection(airProjection);

	airVoronoi = d3.geom.voronoi()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; })
		.clipExtent([[0, 0], [width, height]]);

	airSvg = d3.select("#chart1").append("svg")
		.attr("width", width)
		.attr("height", height);

	queue()
		.defer(d3.json, "data/us.json")
		.defer(d3.csv, "data/airports.csv")
		.defer(d3.csv, "data/flights.csv")
		.await(airReady);
}

function airReady(error, us, airports, flights) {
  var airportById = d3.map(),
      positions = [];

  airports.forEach(function(d) {
    airportById.set(d.iata, d);
    d.outgoing = [];
    d.incoming = [];
  });

  flights.forEach(function(flight) {
    var source = airportById.get(flight.origin),
        target = airportById.get(flight.destination),
        link = {source: source, target: target};
    source.outgoing.push(link);
    target.incoming.push(link);
  });

  airports = airports.filter(function(d) {
    if (d.count = Math.max(d.incoming.length, d.outgoing.length)) {
      d[0] = +d.longitude;
      d[1] = +d.latitude;
      var position = airProjection(d);
      d.x = position[0];
      d.y = position[1];
      return true;
    }
  });

  airVoronoi(airports)
      .forEach(function(d) { d.point.cell = d; });

  airSvg.append("path")
      .datum(topojson.feature(us, us.objects.land))
      .attr("class", "states")
      .attr("d", airPath);

  airSvg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "state-borders")
      .attr("d", airPath);

  var airport = airSvg.append("g")
      .attr("class", "airports")
    .selectAll("g")
      .data(airports.sort(function(a, b) { return b.count - a.count; }))
    .enter().append("g")
      .attr("class", "airport")
	  // Big Hint: click here: .on("click"...
	  // see debugAirportData function below.
	  .on("click", debugAirportData)
	  .on("mouseover", showAirportName)
	  .on("mouseout", showBlank)
	  // mouseout here
	  ;

  airport.append("path")
      .attr("class", "airport-cell")
      .attr("d", function(d) { return d.cell.length ? "M" + d.cell.join("L") + "Z" : null; });

  airport.append("g")
      .attr("class", "airport-arcs")
    .selectAll("path")
      .data(function(d) { return d.outgoing; })
    .enter().append("path")
      .attr("d", function(d) { return airPath({type: "LineString", coordinates: [d.source, d.target]}); });

  airport.append("circle")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("r", function(d, i) { return Math.sqrt(d.count); });
}

// Big hint for you for doing Assignment 2
function debugAirportData(d, i) {
	console.log(d);
	// When an airport is clicked this function is called
    document.getElementById('clabel2').innerHTML = 'Largest Destinations from ' + d.name;
	// What would you populate the bar chart with? Check the outgoing array, target property
	var size = [];
	var outgoing = d.outgoing;
	/*
	outgoing.forEach(function(a) {
	var outgoing_airport = a.target.iata;
	var outgoing_count = a.target.count;
    size.push({key: outgoing_airport, v: outgoing_count});
	}
	);*/

    var top20 = outgoing.sort(function(a, b){return parseFloat(b.target.count)-parseFloat(a.target.count); })
               .slice(0, Math.min(20, outgoing.length));
    //dumpDataset(top20);
    d3.select("#chart2").select('svg').remove();
    D3WRAP.SimpleBarChart("#chart2", top20, {});

	// What for each airport in the outgoing array what value would you use? Try the count property.
	// Don't forget to sort the array, and truncate to the 1st 20 only.
}

function showAirportName (d) {
    document.getElementById('clabel1').innerHTML = d.name + '(' + d.outgoing.length + ')';
    //document.getElementById('clabel2').innerHTML = 'Largest Destinations from ' + d.name;
}

function showBlank (d) {
    document.getElementById('clabel1').innerHTML = 'Airport Map';
    document.getElementById('clabel2').innerHTML = 'Size Barchart';
}
