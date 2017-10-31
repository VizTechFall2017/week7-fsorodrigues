var width = document.getElementById('svg1').clientWidth;
var height = document.getElementById('svg1').clientHeight;

var marginLeft = 100;
var marginTop = 100;

var nestedData = [];

var svg = d3.select('#svg1')
    .append('g')
    .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');

var svg2 = d3.select('#svg2')
    .append('g')
    .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');

//these are the size that the axes will be on the screen; set the domain values after the data loads.
var scaleX = d3.scaleBand().rangeRound([0, (width - 2 * marginLeft)]).padding(0.1);
var scaleY = d3.scaleLinear().range([(height - 2 * marginTop), 0]);


//import the data from the .csv file
d3.csv('./countryData_topten.csv', function(dataIn){

    nestedData = d3.nest()
        .key(function(d){return d.year})
        .entries(dataIn);

    var loadData = nestedData.filter(function(d){return d.key == '1987'})[0].values;

    // Add the x Axis
    svg.append("g")
        .attr('class','xaxis')
        .attr('transform','translate(0,' + (height - 2 * marginTop) + ')')  //move the x axis from the top of the y axis to the bottom
        .call(d3.axisBottom(scaleX));

    svg.append("g")
        .attr('class', 'yaxis')
        .call(d3.axisLeft(scaleY));

    svg2.append("g")
        .attr('class','xaxis')
        .attr('transform','translate(0,' + (height - 2 * marginTop) + ')')  //move the x axis from the top of the y axis to the bottom
        .call(d3.axisBottom(scaleX));

    svg2.append("g")
        .attr('class', 'yaxis')
        .call(d3.axisLeft(scaleY));

/*
    svg.append('text')
        .text('Weekly income by age and gender')
        .attr('transform','translate(300, -20)')
        .style('text-anchor','middle');

    svg.append('text')
        .text('age group')
        .attr('transform','translate(260, 440)');

    svg.append('text')
        .text('weekly income')
        .attr('transform', 'translate(-50,250)rotate(270)');

        */

    //bind the data to the d3 selection, but don't draw it yet
    //svg.selectAll('rect')
    //    .data(loadData, function(d){return d;});

    //call the drawPoints function below, and hand it the data2016 variable with the 2016 object array in it
    drawPoints(loadData);

});

//this function draws the actual data points as circles. It's split from the enter() command because we want to run it many times
//without adding more circles each time.
function drawPoints(pointData){

    scaleX.domain(pointData.map(function(d){return d.countryCode;}));
    scaleY.domain([0, d3.max(pointData.map(function(d){return +d.totalPop}))]);

    d3.selectAll('.xaxis')
        .call(d3.axisBottom(scaleX));

    d3.selectAll('.yaxis')
        .call(d3.axisLeft(scaleY));

    //select all bars in the DOM, and bind them to the new data
    var rects = svg.selectAll('.bars')
        .data(pointData, function(d){return d.countryCode;});

    //look to see if there are any old bars that don't have keys in the new data list, and remove them.
    rects.exit()
        .remove();

    //update the properties of the remaining bars (as before)
    rects.transition()
        .duration(200)
        .attr('x',function(d){
            return scaleX(d.countryCode);
        })
        .attr('y',function(d){
            return scaleY(d.totalPop);
        })
        .attr('width',function(d){
            return scaleX.bandwidth();
        })
        .attr('height',function(d){
            return (height - 2 * marginTop) - scaleY(d.totalPop);  //400 is the beginning domain value of the y axis, set above
        });

    //add the enter() function to make bars for any new countries in the list, and set their properties
    rects.enter()
        .append('rect')
        .attr('class','bars')
        .attr('fill', "slategray")
        .attr('x',function(d){
            return scaleX(d.countryCode);
        })
        .attr('y',function(d){
            return scaleY(d.totalPop);
        })
        .attr('width',function(d){
            return scaleX.bandwidth();
        })
        .attr('height',function(d){
            return (height - 2 * marginTop) - scaleY(d.totalPop);  //400 is the beginning domain value of the y axis, set above
        });

        var rects2 = svg2.selectAll('.bars')
            .data(pointData, function(d){return d.countryCode;});

        //look to see if there are any old bars that don't have keys in the new data list, and remove them.
        rects2.exit()
            .remove();

        //update the properties of the remaining bars (as before)
        rects2.transition()
            .duration(200)
            .attr('x',function(d){
                return scaleX(d.countryCode);
            })
            .attr('y',function(d){
                return scaleY(d.totalPop);
            })
            .attr('width',function(d){
                return scaleX.bandwidth();
            })
            .attr('height',function(d){
                return (height - 2 * marginTop) - scaleY(d.totalPop);  //400 is the beginning domain value of the y axis, set above
            });

        //add the enter() function to make bars for any new countries in the list, and set their properties
        rects2.enter()
            .append('rect')
            .attr('class','bars')
            .attr('fill', "slategray")
            .attr('x',function(d){
                return scaleX(d.countryCode);
            })
            .attr('y',function(d){
                return scaleY(d.totalPop);
            })
            .attr('width',function(d){
                return scaleX.bandwidth();
            })
            .attr('height',function(d){
                return (height - 2 * marginTop) - scaleY(d.totalPop);  //400 is the beginning domain value of the y axis, set above
            });



}


function updateData(selectedYear){
    return nestedData.filter(function(d){return d.key == selectedYear})[0].values;
}


//this function runs when the HTML slider is moved
function sliderMoved(value){

    newData = updateData(value);
    drawPoints(newData);

}
