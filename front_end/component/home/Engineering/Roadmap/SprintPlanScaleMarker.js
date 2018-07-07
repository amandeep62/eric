var color = ['#9F9F9F', '#218D88'];
var lineMax = 0;

// Drawing release dots on graph
function drawReleaseDateMarkers(roadmapData, svg, yCord) {

    var today = new Date();
    var date = parseInt(today.getUTCDate());
    var month = parseInt(today.getMonth() + 1); //January is 0!
    var year = parseInt(today.getFullYear());
    roadmapData.map(function (element, index) {

        var count = 0;

        if (parseInt(element.endDate.getFullYear()) > year) {
            count = 0;
        } else if (parseInt(element.endDate.getMonth() + 1) < month) {
            count = 1;
        } else if (parseInt(element.endDate.getMonth() + 1) == month && parseInt(element.endDate.getUTCDate()) < date) {
            count = 1;
        }

        var focus = svg.append("g")
            .attr('fill', 'white')
            .style("display", "block");

        focus.append("circle")
            .attr('class', 'roadmap-circle')
            .attr('cx', element.x)
            .attr('cy', yCord)
            .attr('fill', color[count])
            .attr("r", 7);

        var focus = svg.append("g")
            .attr('fill', 'white')
            .style("display", "block");

        var circleY;
        var textY;
        var clineY;
        if (index % 2 == 0) {
            circleY = yCord - 70;
            textY = yCord - 77;
            clineY = circleY + 20;
        } else {
            circleY = yCord + 70;
            textY = yCord + 63;
            clineY = circleY - 20;
        }
        focus.append("circle")
            .attr('cx', element.x)
            .attr('cy', circleY)
            .attr('fill', color[count])
            .attr("r", 25);

        focus.append("line")
            .attr("stroke", color[count])
            .attr("stroke-width", 1)
            .attr("x1", element.x)
            .attr("y1", yCord)
            .attr("x2", element.x)
            .attr("y2", clineY);

        svg.append('svg:text')
            .attr('class', 'roadmap-text')
            .append('svg:tspan')
            .attr('x', element.x - 20)
            .attr('y', textY)
            .attr('dy', 5)
            .text('UDN : ' + ((typeof element.version == "string")? element.version : element.version.toFixed(1)) )
            .append('svg:tspan')
            .attr('x', element.x - 10)
            .attr('y', textY)
            .attr('dy', 20)
            .text(function () {
                return (element.endDate.getMonth() + 1) + '/' + parseInt(element.endDate.getUTCDate())
            });


        count++;
    });
}

function drawDateMarkers(roadmapDataArray, period, session, yCord) {
    var margin = { top: 20, right: 50, bottom: 30, left: 50 },
        width = 600 + margin.left + margin.right,
        height = 50 + margin.top + margin.bottom;
    d3.select("#roadmapChart").html("");
    var svg = d3.select("#roadmapChart").append("svg:svg")
        .attr("class", "scaling-svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    if (roadmapDataArray != null && roadmapDataArray.length > 0) {
        var x = d3.scale.linear()
            .range([roadmapDataArray[0].x, roadmapDataArray[roadmapDataArray.length - 1].x]);
    }

    var y = d3.scale.linear()
        .range([height, 0]);

    svg.append("line")
        .attr("stroke", 'white')
        .attr("stroke-width", 4)
        .attr("x1", 0)
        .attr("y1", yCord)
        .attr("x2", lineMax)
        .attr("y2", yCord);

    svg.append("circle")
        .attr('cx', 0)
        .attr('cy', yCord)
        .attr('fill', 'lightgrey')
        .attr("r", 5);

    svg.append("circle")
        .attr('cx', lineMax)
        .attr('cy', yCord)
        .attr('fill', 'lightgrey')
        .attr("r", 5);

    var diff = lineMax / period;
    var xValue = 0;
    var xValueText = 0;
    var monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // draw line dividers
    var j = 0;

    if (session == 2) {
        monthArray = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }

    do {
        xValue = diff * j;
        xValueText = xValue + (diff / 2);
        svg.append("line")
            .attr("stroke", 'white')
            .attr("stroke-width", 4)
            .attr("x1", xValue)
            .attr("y1", yCord - 15)
            .attr("x2", xValue)
            .attr("y2", yCord + 15);

        svg.append('svg:text')
            .attr('fill', 'white')
            .append('svg:tspan')
            .attr('x', xValueText)
            .attr('y', yCord + 25)
            .text(monthArray[j])
        j++;
    } while (j < period)

    return svg;
}

function getRoundedWidth() {
    return Math.round(window.innerWidth / 100) * 100;
}

export function drawRoadmap(roadmapData, period) {
    var roadmapDataArray = [];
    var versionsArray = [];

    var formattedWidth = getRoundedWidth();

    var yCord = 100;   //placing y co-ordinate as constant for straight line
    lineMax = 0;

    if (formattedWidth > 900) {
        lineMax = formattedWidth - 200
    } else {
        lineMax = 720;
    }

    roadmapData.map(function (element) {
        var endDate = new Date(element.end_time);
        var version_name = element.name;
        if (element.actual_end_time != "") {
            endDate = new Date(element.actual_end_time);
        }


        if (versionsArray.indexOf(version_name) < 0) {
            versionsArray.push(version_name);
            roadmapData.map(function (value) {
                if (version_name === value.name) {
                    var date = new Date(value.end_time).getTime();
                    if (endDate.getTime() < date) {
                        endDate = new Date(date);
                    }
                }
            });

            var xCord;
            var month = endDate.getMonth();
            var day = endDate.getDate();
            var days_in_month = daysInMonth(endDate);


            var sessionWidth = lineMax / period;
            xCord = (day * (sessionWidth / days_in_month)) + ((month) * sessionWidth);

            var data = {
                'version': element.number,
                'version_name': version_name,
                'endDate': endDate,
                'x': xCord
            }

            roadmapDataArray.push(data);
        }
    });
    
    var svg = drawDateMarkers(roadmapDataArray, period, 0, yCord);
    drawReleaseDateMarkers(roadmapDataArray, svg, yCord);
}

// function returns number of day in provided date's month
function daysInMonth(date) {
    return new Date(date.getYear(),
        date.getMonth() + 1,
        0).getDate();
}