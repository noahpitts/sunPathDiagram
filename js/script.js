var current_dObj = dObj;
var dropDownValue = "DryBulbTemp";
var dayStep = 21;
var hourStep = 5 / 3;

// Margin around Sun Path Diagram
var margin = 40;
// Radius of Sun Path Diagram
var radius = 250

// When the dropdown changes
var dropDownChanged = function (evt) {
    var selectedThing = evt.target.options[evt.target.options.selectedIndex];
    var selectedValue = selectedThing.value;
    dropDownValue = selectedValue;

    onDataLoaded(current_dObj);
}

var incHour = function () {
    if (hourStep > 3) return;
    hourStep += 1 / 3;
    console.log(hourStep);
    onDataLoaded(current_dObj);
}
var decHour = function () {
    if (hourStep < 19 / 30) return;
    hourStep -= 1 / 3;
    console.log(hourStep);
    onDataLoaded(current_dObj);
}

var incDay = function () {
    if (dayStep > 20) return;
    dayStep++;
    console.log(dayStep);
    onDataLoaded(current_dObj);
}
var decDay = function () {
    if (dayStep < 3) return;
    dayStep--;
    console.log(dayStep);
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

    var vals = [];
    // Create Bins

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
                        val += tick.valueOf(dropDownValue);
                        count++;
                    }
                }
                // average the data value
                val /= count;
                vals.push(val);
                newBin.solarPath.value = val;
                winterBins.push(newBin);
            }
        }
    }

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
                        val += tick.valueOf(dropDownValue);
                        count++;
                    }
                }
                // average the data value
                val /= count;
                vals.push(val);
                newBin.solarPath.value = val;
                summerBins.push(newBin);
            }
        }
    }

    var maxVal = d3.max(vals);
    var minVal = d3.min(vals);
    console.log(minVal, maxVal);

    // Scale color
    var cScale = d3.scale.linear()
        .domain([minVal, maxVal])
        .interpolate(d3.interpolate)
        .range([d3.rgb(30, 30, 30), d3.rgb(30, 150, 210)]);

    // ****************************************************************
    // WINTER - SPRING
    // ****************************************************************

    // Art Board
    var board = dY.graph.addBoard("#dy-canvas-winter", { inWidth: radius * 2, inHeight: radius * 2, margin: margin });

    // Board for SunPath
    var sunPathWinter = board.g.append("g")
        .attr("transform", "translate(" + radius + "," + radius + ") ")
        .attr({ class: "background" });


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
            cx: 0,
            r: radius
        });
    var axisCen = sunPathWinter.append("g").attr("class", "axis")
    axisCirc.append("circle")
        .attr({
            cx: 0,
            r: radius * 0.01
        });
    // radial arc
    var startAngle = Math.PI / 4;
    var endAngle = 7 * Math.PI / 4;
    var resolution = (endAngle - startAngle) / (2 * Math.PI) * 360;
    // startAngle += Math.PI / 2;
    // endAngle += Math.PI / 2;
    var angle = d3.scale.linear()
        .domain([0, resolution - 1])
        .range([startAngle, endAngle]);

    var line = d3.svg.line.radial()
        .interpolate("basis")
        .tension(0)
        .radius(radius * 1.05)
        .angle(function (d, i) { return angle(i); });

    var arcPathSum = sunPathWinter.append("g").attr("class", "axis");
    arcPathSum.append("path")
        .datum(d3.range(resolution))
        .attr("d", line);

    // draw the text
    var angAxisGroups = sunPathWinter.append("g") // angAxisGroups is a reference to a collection of subgroups within this group. each subgroup has data bound to it related to one of 12 values: angles between 0 and 360
        .attr("class", "axis")
        .selectAll("g")
        .data(d3.range(0, 360, 15)) // bind 12 data objects (0-360 in steps of x)
        .enter().append("g")
        .attr("transform", function (d) { return "rotate(" + d + ")"; }); // rotate each subgroup about the origin by the proper angle
    var ctrOffset = radius / 5;
    angAxisGroups.append("line") // append a line to each
        .attr("x1", ctrOffset) // we only need to define x1 and x2, allowing y0 and y1 to default to 0
        .attr("x2", radius * 1.1);

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

    // ****************************************************************
    // SUMMER - FALL
    // ****************************************************************
    // Art Board
    var board = dY.graph.addBoard("#dy-canvas-summer", { inWidth: radius * 2, inHeight: radius * 2, margin: margin });

    // Board for SunPath
    var sunPathSummer = board.g.append("g")
        .attr("transform", "translate(" + radius + "," + radius + ") ")
        .attr({ class: "background" });



    // .on("mouseenter", function (d) {
    //     d3.select(this).style("stroke-width", "1px");
    // })
    // .on("mouseoout", function (d) {
    //     d3.select(this).style("stroke-width", "0.1px");
    // })
    // ;
    //.on("mouseout", function (d) { d3.select(this).attr({ class: "bin" }); });

    // draw the circle
    var axisCircSum = sunPathSummer.append("g").attr("class", "axis")
    axisCircSum.append("circle")
        .attr({
            cx: 0,
            r: radius
        });

    var axisCenSum = sunPathSummer.append("g").attr("class", "axis")
    axisCenSum.append("circle")
        .attr({
            cx: 0,
            r: radius * 0.01
        });


    // radial arc
    var startAngle = Math.PI / 4;
    var endAngle = 7 * Math.PI / 4;
    var resolution = (endAngle - startAngle) / (2 * Math.PI) * 360;
    // startAngle += Math.PI / 2;
    // endAngle += Math.PI / 2;
    var angle = d3.scale.linear()
        .domain([0, resolution - 1])
        .range([startAngle, endAngle]);

    var line = d3.svg.line.radial()
        .interpolate("basis")
        .tension(0)
        .radius(radius * 1.05)
        .angle(function (d, i) { return angle(i); });

    var arcPathSum = sunPathSummer.append("g").attr("class", "axis");
    arcPathSum.append("path")
        .datum(d3.range(resolution))
        .attr("d", line);

    // draw the text
    var angAxisGroups = sunPathSummer.append("g") // angAxisGroups is a reference to a collection of subgroups within this group. each subgroup has data bound to it related to one of 12 values: angles between 0 and 360
        .attr("class", "axis")
        .selectAll("g")
        .data(d3.range(0, 360, 15)) // bind 12 data objects (0-360 in steps of x)
        .enter().append("g")
        .attr("transform", function (d) { return "rotate(" + d + ")"; }); // rotate each subgroup about the origin by the proper angle
    var ctrOffset = radius / 5;
    angAxisGroups.append("line") // append a line to each
        .attr("x1", ctrOffset) // we only need to define x1 and x2, allowing y0 and y1 to default to 0
        .attr("x2", radius * 1.1);

    // var textPadding = 10;
    // angAxisGroups.append("text") // append some text to each
    //     .attr("x", radius + textPadding * 2)
    //     .attr("dy", textPadding / 2) // nudge text down a bit
    //     .style("text-anchor", function (d) { return d > 180 ? "end" : null; })
    //     .attr("transform", function (d) { return d > 180 ? "rotate(180 " + (radius + textPadding * 2) + ",0)" : null; })
    //     .text(function (d) { return d > 270 ? null : d; });

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

}

