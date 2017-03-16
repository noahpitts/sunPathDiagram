var current_dObj = dObj;
var dropDownValue = "";
var dayStep = 21;
var hourStep = 2 / 3;

// When the dropdown changes
var dropDownChanged = function (evt) {
    var selectedThing = evt.target.options[evt.target.options.selectedIndex];
    var selectedValue = selectedThing.value;
    dropDownValue = selectedValue;

    onDataLoaded(current_dObj);
}

var incHour = function (evt) {
    if (hourStep > 3) return;
    hourStep += 1 / 3;
    onDataLoaded(current_dObj);
}
var decHour = function (evt) {
    if (hourStep < 19 / 30) return;
    hourStep -= 1 / 3;
    onDataLoaded(current_dObj);
}

var incDay = function (evt) {
    if (dayStep > 30) return;
    dayStep++;
    onDataLoaded(current_dObj);
}
var decDay = function (evt) {
    if (dayStep < 3) return;
    dayStep--;
    onDataLoaded(current_dObj);
}



// On Data Loaded Function
function onDataLoaded(dObj) {
    d3.selectAll("svg").remove();
    current_dObj = dObj;

    // create a location object
    var location = {
        lat: dObj.location.latitude,
        lon: dObj.location.longitude,
        tmz: dObj.location.timezone
    };

    // Margin around Sun Path Diagram
    var margin = 40;
    // Radius of Sun Path Diagram
    var radius = 200


    // Scale color
    var cScale = d3.scale.linear()
        .domain([-10, 10])
        .interpolate(d3.interpolate)
        .range([d3.rgb("#20ccee"), d3.rgb('#303030')]);

    // Scales the value to polar coordinate theta
    var angScale = d3.scale.linear()
        .domain([0, 360])
        .range([0, 2 * Math.PI]);

    // Scales the value to polar coordinate r
    var radScale = d3.scale.linear()
        .domain([90, 0])
        .range([0, radius]);

    // Draw Value Paths
    var pathLine = d3.svg.line.radial()
        .radius(function (d) { return radScale(d.altitudeDeg); })
        .angle(function (d) { return angScale(d.azimuthDeg); })
        .interpolate("linear");


    // ****************************************************************
    // WINTER - SPRING
    // ****************************************************************

    // Create winterBins
    var winterBins = [];

    for (var d = 0; d < 172; d += dayStep) {
        for (var h = 0; h < 22; h += hourStep) {
            var newBin = new bin(location, d, d + dayStep, h, h + hourStep);
            if (newBin.isVisible()) {
                newBin.generateSolarPath(5);

                // iterate over data values in range
                var val = 0;
                var count = 0;
                for (var d_v = Math.floor(d); d_v < Math.floor(d) + dayStep; d_v++) {
                    for (var h_v = Math.floor(h); h_v < Math.floor(h) + hourStep; h_v++) {
                        // sum data over range
                        var dayOfYear = d_v * 24 + h_v;
                        var tick = dObj.ticks[dayOfYear];
                        // val += tick.valueOf("DryBulbTemp");
                        val += tick.valueOf(dropDownValue);
                        count++;
                    }
                }
                // average the data value
                newBin.solarPath.value = 25 - val / count;
                winterBins.push(newBin);
            }
        }
    }

    // Art Board
    var board = dY.graph.addBoard("#dy-canvas-winter", { inWidth: radius * 2, inHeight: radius * 2, margin: margin });

    // Board for SunPath
    var sunPathWinter = board.g.append("g")
        .attr("transform", "translate(" + radius + "," + radius + ") ")
        .attr({ class: "background" });

    // draw the winterBins
    sunPathWinter.append("g").selectAll("path")
        .data(winterBins)
        .enter().append("path")
        .datum(function (d) { return d.solarPath; })
        .attr({
            d: pathLine,
            class: "bin",
            fill: function (d) { return cScale(d.value); }
        })
    // .on("mouseenter", function (d) {
    //     d3.select(this).style("stroke-width", "1px");
    // })
    // .on("mouseoout", function (d) {
    //     d3.select(this).style("stroke-width", "0.1px");
    // })
    // ;
    //.on("mouseout", function (d) { d3.select(this).attr({ class: "bin" }); });

    // draw the circle
    var axisCirc = sunPathWinter.append("g").attr("class", "axis")
    axisCirc.append("circle")
        .attr({
            cx: 4,
            r: radius
        });

    // ****************************************************************
    // SUMMER - FALL
    // ****************************************************************

    // Create SummerBins
    var summerBins = [];

    for (var d = 172; d < 351; d += dayStep) {
        for (var h = 0; h < 22; h += hourStep) {
            var newBin = new bin(location, d, d + dayStep, h, h + hourStep);
            if (newBin.isVisible()) {
                newBin.generateSolarPath(5);

                // iterate over data values in range
                var val = 0;
                var count = 0;
                for (var d_v = Math.floor(d); d_v < Math.floor(d) + dayStep; d_v++) {
                    for (var h_v = Math.floor(h); h_v < Math.floor(h) + hourStep; h_v++) {
                        // sum data over range
                        var dayOfYear = d_v * 24 + h_v;
                        var tick = dObj.ticks[dayOfYear];
                        // val += tick.valueOf("DryBulbTemp");
                        val += tick.valueOf(dropDownValue);
                        count++;
                    }
                }
                // average the data value
                newBin.solarPath.value = 25 - val / count;
                summerBins.push(newBin);
            }
        }
    }

    // Art Board
    var board = dY.graph.addBoard("#dy-canvas-summer", { inWidth: radius * 2, inHeight: radius * 2, margin: margin });

    // Board for SunPath
    var sunPathSummer = board.g.append("g")
        .attr("transform", "translate(" + radius + "," + radius + ") ")
        .attr({ class: "background" });

    // draw the summerBins
    sunPathSummer.append("g").selectAll("path")
        .data(summerBins)
        .enter().append("path")
        .datum(function (d) { return d.solarPath; })
        .attr({
            d: pathLine,
            class: "bin",
            fill: function (d) { return cScale(d.value); }
        })
    // .on("mouseenter", function (d) {
    //     d3.select(this).style("stroke-width", "1px");
    // })
    // .on("mouseoout", function (d) {
    //     d3.select(this).style("stroke-width", "0.1px");
    // })
    // ;
    //.on("mouseout", function (d) { d3.select(this).attr({ class: "bin" }); });

    // draw the circle
    var axisCirc = sunPathSummer.append("g").attr("class", "axis")
    axisCirc.append("circle")
        .attr({
            cx: 4,
            r: radius
        });







}

