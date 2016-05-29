// see: http://bl.ocks.org/ameyms/9184728
var D3WRAP = { REVISION: '1' };
var colorGenerator = d3.scale.category20();

// Bar Chart Object
D3WRAP.SimpleBarChart = function(container, dataset, params) {
	this.container = container;
	this.dataset = dataset;
	this.params = params;
	var self = this;


	// Provide parameter defaults if they are missing
	this.barConfig = {
		width : params.width || 760,
		height : params.height ||340,
		leftMargin : params.leftMargin || 40,
		topMargin : params.topMargin || 20,
		yScale : params.yScale || 150.0,
		xScale : params.xScale || 20.0,
		barWidth : params.barWidth || 35.0,
		chartWidth: params.chartWidth || 700,
		chartHeight : params.chartHeight || 300
	}

	// Function to adjust scales
	this.adjustScales = function() {
		self.yScale = d3.scale.linear()
			.domain([0, d3.max(self.dataset, function(d){return d.target.count;})+10])
			.range([self.barConfig.chartHeight, 0])
			;
		self.xScale = d3.scale.linear()
			.domain([0, self.dataset.length])
			.range([0, self.barConfig.chartWidth])
			;
	}
	
	// Select the DOM element into which we will insert the chart
	this.c1 = d3.select(container);
	// Append an SVG to the DOM element with an offset from the upper left corner
	this.svg1 = this.c1.append("svg")
		.attr("width", this.barConfig.width)
		.attr("height", this.barConfig.height)
		.append("g")
		.attr("transform", "translate(" + this.barConfig.leftMargin + "," + this.barConfig.topMargin + ")")
		;
	
	this.adjustScales();
	
	// Create axes and append to SVG
	this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom");
	this.yAxis = d3.svg.axis().scale(this.yScale).orient("left");
	this.svg1.append("g").attr("class", "xaxis axis")
		.attr("transform", "translate(0," + this.barConfig.chartHeight + ")")
		.call(this.xAxis)
		;
	this.svg1.append("g").attr("class", "yaxis axis").call(this.yAxis);
	
	// Creation of DOM elements in SVG from initial data
	this.svg1.selectAll("rect")
		.data(this.dataset,function(d){return d.target.iata;})
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d,i){return self.xScale(i);})
		.attr("y", function(d,i){return self.yScale(d.target.count);})
		.attr("width", function(d,i){return self.barConfig.chartWidth/self.dataset.length-4;})
		.attr("height", function(d,i) {return self.barConfig.chartHeight-self.yScale(d.target.count);})
		.attr("fill", function(d) {return colorGenerator(d.target.count);})
		;

	this.svg1.selectAll("text.btext")
		.data(this.dataset,function(d){return d.target.iata;})
		.enter().append("text")
		.attr("class", "btext")
		.attr("x", function(d,i){return self.xScale(i)+5;})
		.attr("y", function(d,i){return self.yScale(d.target.count)-20;})
		.text(function(d,i){return d.target.iata;})
		;

	
}
D3WRAP.SimpleBarChart.prototype = Object.create(Object.prototype);
D3WRAP.SimpleBarChart.prototype.constructor = D3WRAP.SimpleBarChart;


D3WRAP.NeedleGauge = function(container, params) {
	this.container = container;
	this.params = params;
	this.el = d3.select(container);
}
D3WRAP.NeedleGauge.prototype = Object.create(Object.prototype);
D3WRAP.NeedleGauge.prototype.constructor = D3WRAP.NeedleGauge;
D3WRAP.NeedleGauge.prototype.setvalue = function (value) {
	this.value = value;
}