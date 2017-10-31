var height = 500;
var width = 675;

var padding = { "top": 50,
                "right": 100,
                "bottom": 0,
                "left": 100 };

// creating svg canvas
var mainSelector = d3.select(".svg-container");

var scaleY = d3.scaleLinear()
                .range([0, height - 4 * (padding.top)])
                .nice(); // making scale end in round number

var scaleX = d3.scaleTime()
                .range([0, width - padding.right - padding.left]);

var formatComma = d3.format(",");

d3.csv("./daca_approvals.csv", function(error, loadData) {
    if (error) { throw error };

    // parsing for number output
    loadData.forEach(function(d){
        d.date = parsingTime(d.date);
        d.initial_intake = +d.initial_intake;
        d.initial_approval = +d.initial_approval;
        d.initial_cumulative = +d.initial_cumulative;
        d.renewal_intake = +d.renewal_intake;
        d.renewal_approval = +d.renewal_approval;
    });

    // var t = textures.lines()
    //           .orientation("7/8", "7/8")
    //           .size(10)
    //           .strokeWidth(.25)
    //           .stroke("#1F5869");
    //
    // svg.call(t);

    scaleX.domain(d3.extent(loadData, function(d) { return d.date; }));

    var dataIn = loadData.filter( function(d) { return d.data_origin == "uscis" });

    var columnsNames = loadData.columns;

    console.log(columnsNames);

    var projection = loadData.filter( function(d) { return d.data_origin == "projection" });

    for (var i = 8; i < columnsNames.length; i++) {
      drawArea(dataIn, columnsNames[i], scaleX, scaleY, "#1F5869");
    }
    // drawing areas charts

    // drawArea(projection, "initial_cumulative", scaleX, scaleY, t.url());
    // drawArea(dataIn, "renewal_approval" , scaleX, scaleY, "#1F5869");

    // drawLine(dataIn, "#1F5869" ,"1,0");

    //drawing projection area chart
    // drawArea(projection, "initial_cumulative", t.url())
    // drawLine(projection, "#1F5869", "0.5,7");

    // window.setTimeout(drawAnnotation, 1200);

    //drawing circles on data points
    // drawPlots(dataIn, "#282D48");



});

var parsingTime = d3.timeParse("%m/%d/%Y");

function drawAnnotation() {

  const type = d3.annotationCalloutCircle
  const annotations = [{
    note: { label: "On Sep 5, Attorney General Jeff Sessions announced the Trump administration would stop receiving work permit applications immediately and cancel the program in six months.", title: "The end of DACA", wrap: 200},
    // data: { date: "9/1/2017", initial_cumulative: 751659 },
    x: 475, y: 118,
    dy:0, dx: -100,
    subject: { radius: 10, radiusPadding: 0 }
  }]

  // const parseTime = d3.timeParse("%b/%d/%Y")
  // const timeFormat = d3.timeFormat("%d/%m/%Y")

  const makeAnnotations = d3.annotation()
    .type(type)
    // accessors & accessorsInverse not needed
    // if using x, y in annotations JSON
    // .accessors({
    //   x: d => scaleX(parseTime(d.date)),
    //   y: d => scaleY(d.initial_cumulative)
    // })
    // .accessorsInverse({
    //    date: d => timeFormat(scaleX.invert(d.scaleX)),
    //    initial_cumulative: d => scaleY.invert(d.scaleY)
    // })
    .annotations(annotations)

  d3.select("svg")
    .append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations);
};

function drawArea(dataset, column, scalex, scaley, fill, i) {

      var maxY = getMaxY(dataset, column);
      scaleY.domain([maxY,0]).nice();

      var svg = mainSelector.append("svg")
                             .attr("class", "svg-" + column + " charts" )
                             .attr("height", height)
                             .attr("width", width)
                             .append("g")
                             .attr("transform", "translate(" + padding.left + "," + 3 * padding.top + ")");

      var initialArea = d3.area()
                           .x(0)
                           .y0(height - 200)
                           .y1(function(d) { return scaleY(d[column]) });

      var area = d3.area()
                     .x(function(d) { return scaleX(d.date) })
                     .y0(height - 200)
                     .y1(function(d) { return scaleY(d[column]) });

      var appendArea = svg.append("g")
                            .attr("class", "area-chart")
                          .append("path")
                          .data([dataset])
                            .attr("class", "area")
                            .attr("fill", fill)
                            .attr("opacity", .5)
                            .attr("d", initialArea)
                             .transition()
                             .duration(1000)
                             .ease(d3.easeCubic)
                            .attr("d", area);

      // calling axis
      xAxis(svg, scalex);
      yAxis(svg, scaley);

      // calling title, subtitle and axis labels
      chartTitle(svg, column);
      // chartSubtitle(svg);
      // xLabel();
      // yLabel(svg);


      drawLine(svg, dataset, column, "#1F5869" ,"1,0");
      drawLine(svg, dataset, column, "#1F5869", "0.5,7");
      drawPlots(svg, dataset, column, fill);

};

function drawLine(container, dataset, column, stroke, dotted) {

      var initialLine = d3.area()
                           .x(0)
                           .y0(height - 200)
                           .y1(function(d) { return scaleY(d[column]) });

      var valueline = d3.line()
                     .x(function(d) { return scaleX(d.date) })
                     .y(function(d) { return scaleY(d[column]) });

      var appendLine = container.append("g")
                                  .attr("class", "line-chart")
                                .append("path")
                                .data([dataset])
                                  .attr("class", "line")
                                  .attr("fill", "none")
                                  .attr("stroke", stroke)
                                  .attr("stroke-width", 2.5)
                                  .style("stroke-linecap", "round")
                                  .style("stroke-dasharray", (dotted))
                                  .attr("opacity", 1)
                                  .attr("d", initialLine)
                                  .transition()
                                  .duration(1000)
                                  .ease(d3.easeCubic)
                                  .attr("d", valueline);
};

function drawPlots(container, dataset, column, fill) {

  // drawing tooltip
  var rects = container.append("g")
                        .attr("class", "rects")

  var tooltips = container.append("g")
                            .attr("class", "text-labels")

  rects.selectAll(".charts")
           .data(dataset)
           .enter()
           .append("rect")
            .attr("class", function(d) { return "c" + d.calendar_year + "-" + d.quarter } )
            .attr("height", 30)
            .attr("width", 65)
            .attr("x", function(d) { return scaleX(d.date) + 3 })
            .attr("y", function(d) { return scaleY(d[column]) - 30 })
            .attr("fill", "#1F5869")
            .attr("opacity", 0)

  tooltips.selectAll(".charts")
           .data(dataset)
           .enter()
           .append("text")
            .attr("class", function(d) { return "c" + d.calendar_year + "-" + d.quarter } )
            .attr("x", function(d) { return scaleX(d.date) + 8 })
            .attr("y", function(d) { return scaleY(d[column]) - 10 })
            .attr("fill", "white")
            .attr("opacity", 0)
            .html(function(d) { return formatComma(d[column]) })

    container.append("g")
                .attr("class", "plots")
              .selectAll("circle")
              .data(dataset)
              .enter()
              .append("circle")
                .attr("opacity", 0)
                .attr("cy", function(d) { return scaleY(d[column]) })
                .attr("fill", fill)
                .attr("class", function(d) { return "c" + d.calendar_year + "-" + d.quarter } )
                .attr("r", 5)
                .on("mouseover", function(d) {
                  var selection = d3.select(this).attr("class");

                  container.selectAll("." + selection)
                            .attr("opacity", 1)
                            .attr("r", 10);

                  d3.selectAll(".charts")
                      .selectAll("." + selection)
                      .attr("opacity", 1)
                      .attr("r", 10);

                })
                .on("mouseout", function(d) {
                  var selection = d3.select(this).attr("class");

                  container.selectAll("." + selection)
                            .attr("opacity", 0)
                            .attr("r", 5);

                  d3.selectAll(".charts")
                      .selectAll("." + selection)
                      .attr("opacity", 0)
                      .attr("r", 5);

                })
                .attr("cx", 0)
                  .transition()
                  .duration(1000)
                  .ease(d3.easeSin)
                .attr("cx", function(d) { return scaleX(d.date) });

};

function getMaxY(dataset,column) {
      return d3.max(dataset, function(d) { return d[column] * 1.05 });
};

// defining functions to append axis
function xAxis(container, scale) {
          container.append("g")
                    .attr("transform", "translate(0," + (height - 4 * (padding.top)) + ")" )
                    .attr("class", "xAxis")
                    .call(d3.axisBottom(scale));
};

function yAxis(container, scale) {
          container.append("g")
                    .attr("transform", "translate(0,0)")
                    .attr("class", "yAxis")
                    .call(d3.axisLeft(scale));
};

// defining functions to append title, subtitle and labels to axis
function chartTitle(container, text) {
          container.append("text")
                    .attr("x", 0)
                    .attr("y", -20)
                    .attr("class", "title")
                    .text(text);
};

function chartSubtitle(container) {
          container.append("text")
                    .attr("x", 0)
                    .attr("y", -25)
                    .attr("class", "subtitle")
                    .text("");
};

// function xLabel() {
//           svg.append("text")
//               .attr("x", 300)
//               .attr("y", 440)
//               .attr("class", "label")
//               .attr("text-anchor", "middle")
//               .text("Total earnings, in USD");
// };

function yLabel(container) {
          container.append("text")
                    .attr("transform", "rotate(270)")
                    .attr("x", -100)
                    .attr("y", -70)
                    .attr("class", "label")
                    .attr("text-anchor", "middle")
                    // .text("Cumulative approvals");
};
