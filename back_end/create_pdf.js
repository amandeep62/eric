const fs = require('fs');
const resizeImg = require('resize-img');
const webshot = require('webshot');
const PDFDocument = require('pdfkit');
const sizeOf = require('image-size');

exports.init = function (app) {

    app.get('/printPDF', function (req, res) {

        var type = req.query["type"];
        var session = req.query["session"];
        var year = req.query["selectedYear"];

        switch (type) {
            case 'roadmap':
                var doc = new PDFDocument({ size: [640, 830], margin: 20 });
                doc.pipe(res);
                var dataArray = JSON.parse(req.query["dataArray"]);
                var summaryArray = JSON.parse(req.query["summaryArray"]);
                var roadmapDataArray = convertDataArray(dataArray, session, year);
                var summariesArray = getSummaries(summaryArray);
                createRoadmapPDF(res, roadmapDataArray, summariesArray, session, year, doc);
                break;
            case 'timeplan':
                var dataArray = req.query["dataArray"];
                createTimeplanPDF(dataArray, res);
                break;
            case 'qualityChart':
                var dataArray = req.query["dataArray"];
                createQualityChart(dataArray, res);
                break;
            case 'fstChart':
                doc = new PDFDocument({ size: [910, 630], margin: 20 });
                doc.pipe(res);
                var dataArray = req.query["dataArray"];
                createFSTChart(dataArray, res, doc);
                break;
            case 'statusChart':
                doc = new PDFDocument({ size: [690, 450], margin: 20 });
                doc.pipe(res);
                var dataArrayDev = req.query["dataArrayDev"];
                var dataArrayTest = req.query["dataArrayTest"];
                createStatusChart(dataArrayDev, dataArrayTest, res, doc);
                break;
        }

    });
}

function createStatusChart(dataArrayDev, dataArrayTest, res, doc) {

    var title = 'UDN Commercial Services DEV Status Chart';
    var options = {
        siteType: 'html',
        customCSS: 'svg { float: right } #donutSVGChart { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; } text { fill: black }'
    };

    doc.font('Helvetica-Bold', 25)
        .fill('black')
        .text(title, 60, 30, {
            align: 'center'
        });

    webshot(dataArrayDev, 'back_end/statusChartDev.png', options, function (err) {
        if (err) {
            console.log(err);
        }
    });

    webshot(dataArrayTest, 'back_end/statusChartTest.png', options, function (err) {
        if (err) {
            console.log(err);
        }
    });

    setTimeout(function getWebshot() {
        resizeImg(fs.readFileSync('back_end/statusChartDev.png'), { width: 600, height: 480 }).then(buf => {
            fs.writeFileSync('back_end/statusChartDev.png', buf);
        });
        resizeImg(fs.readFileSync('back_end/statusChartTest.png'), { width: 600, height: 480 }).then(buf => {
            fs.writeFileSync('back_end/statusChartTest.png', buf);
        });
    }, 3500);

    setTimeout(function getWebshot() {
        doc.image('back_end/statusChartDev.png', 0, 85);
        doc.addPage();
        var title = 'UDN Commercial Services TEST Status Chart';
        doc.font('Helvetica-Bold', 25)
            .fill('black')
            .text(title, 60, 30, {
                align: 'center'
            });
        doc.image('back_end/statusChartTest.png', 0, 85);
        doc.end();
        fs.unlinkSync('back_end/statusChartDev.png');
        fs.unlinkSync('back_end/statusChartTest.png');
    }, 4000);

}


function createTimeplanPDF(dataArray, res) {

    var htmlc = '<html><body>' + dataArray + '</body></html>';
    var title = 'UDN Commercial Services Time Plan';
    var options = {
        siteType: 'html',
        customCSS: '.table >tbody >tr >td, .table >tbody >tr >th { padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #ddd; } .table-striped > tbody > tr:nth-child(odd) > td, .table-striped > tbody > tr:nth-child(odd) > th {background-color: #47687c;} .table-striped > tbody {background-color: #1e3c4f;} .plan-table { color: white; width: 850; padding: 10px; margin: 0 auto; border: 2px solid rgba(255, 255, 255, 0.2); font-family: "montserratregular"; text-align: left; } .plan-header-row { padding: 15px; background-color: #4C8DB6; text-transform: uppercase; font-size: 15px; font-family: Montserrat, sans-serif; color: #fff; letter-spacing: .8px; line-height: 2.42857143; } .plan-body-row { font-size: 15px; letter-spacing: .8px; } .tdAlign { text-align: left; padding-left: 20px !important; } '
    };

    webshot(htmlc, 'back_end/timeplan.png', options, function (err) {
        if (err) {
            console.log(err);
        }
    });

    setTimeout(function getWebshot() {

        var dimensions = sizeOf('back_end/timeplan.png');
        doc = new PDFDocument({ size: [dimensions.width, dimensions.height], margin: 20 });
        doc.pipe(res);
        doc.font('Helvetica-Bold', 25)
            .fill('black')
            .text(title, 60, 30, {
                align: 'center'
            });
        doc.image('back_end/timeplan.png', 0, 75);
        doc.end();
        fs.unlinkSync('back_end/timeplan.png');
    }, 3200);
}


function createFSTChart(dataArray, res, doc) {

    var title = 'UDN Commercial Services FST Chart';
    var options = {
        siteType: 'html',
        customCSS: ' text { fill: black; font: 16px sans-serif; }'
    };

    doc.font('Helvetica-Bold', 25)
        .fill('black')
        .text(title, 40, 30, {
            align: 'center'
        });

    webshot(dataArray, 'back_end/FST_Chart.png', options, function (err) {
        if (err) {
            console.log(err);
        }
    });

    setTimeout(function getWebshot() {
        resizeImg(fs.readFileSync('back_end/FST_Chart.png'), { width: 760, height: 640 }).then(buf => {
            fs.writeFileSync('back_end/FST_Chart.png', buf);
        });
    }, 3000);

    setTimeout(function getWebshot() {
        doc.image('back_end/FST_Chart.png', 40, 105);
        doc.end();
        fs.unlinkSync('back_end/FST_Chart.png');
    }, 3500);
}


function createQualityChart(dataArray, res) {

    var title = 'UDN Commercial Services Quality Chart';
    var htmlc = '<html><body>' + dataArray + '</body></html>';
    var options = {
        siteType: 'html',
        customCSS: '.table >tbody >tr >td, .table >tbody >tr >th { padding: 8px; line-height: 1.42857143; vertical-align: top; border-top: 1px solid #ddd; } .table-striped > tbody > tr:nth-child(odd) > td, .table-striped > tbody > tr:nth-child(odd) > th {background-color: #47687c;} .table-striped > tbody {background-color: #1e3c4f;} .plan-table { color: white; width: 850; padding: 10px; margin: 0 auto; border: 2px solid rgba(255, 255, 255, 0.2); font-family: "montserratregular"; text-align: left; } .plan-header-row { padding: 15px; background-color: #4C8DB6; text-transform: uppercase; font-size: 15px; font-family: Montserrat, sans-serif; color: #fff; letter-spacing: .8px; line-height: 2.42857143; } .plan-body-row { font-size: 15px; letter-spacing: .8px; } .tdAlign { text-align: left; padding-left: 20px !important; } '
    };

    webshot(htmlc, 'back_end/qualityChart.png', options, function (err) {
        if (err) {
            console.log(err);
        }
    });

    setTimeout(function getWebshot() {
        var dimensions = sizeOf('back_end/qualityChart.png');
        doc = new PDFDocument({ size: [dimensions.width, dimensions.height], margin: 20 });
        doc.pipe(res);
        doc.font('Helvetica-Bold', 25)
            .fill('black')
            .text(title, 40, 30, {
                align: 'center'
            });
        doc.image('back_end/qualityChart.png', 0, 75);
        doc.end();
        fs.unlinkSync('back_end/qualityChart.png');
    }, 3200);
}


function createRoadmapPDF(res, roadmapDataArray, summaryArray, session, year, doc) {

    var yCord = 200;
    var delta = 30;
    var title = 'UDN Commercial Services Roadmap ' + year;
    doc.font('Helvetica-Bold', 25)
        .fill('black')
        .text(title, 50, 30, {
            align: 'center'
        });

    drawDateMarker(doc, yCord, session, delta, year);
    drawReleaseDateMarkers(doc, roadmapDataArray, yCord, delta);
    drawSummaries(doc, yCord, summaryArray, delta);
    doc.end();
}

function drawDateMarker(doc, yCord, session, delta, year) {
    var period = 6;
    var lineMax = 540;
    if (session == 0) {
        period = 12;
    }

    doc.font('Helvetica-Bold', 12)
        .fill('#218D88')
        .text(year, 540, 100);

    doc.moveTo(delta, yCord)
        .lineTo(lineMax + delta, yCord)
        .lineWidth(2)
        .stroke();

    var diff = lineMax / period;
    var monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (session == 2) {
        monthArray = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }

    // draw line dividers
    var j = 0;
    var xValue = 0;
    do {
        xValue = diff * j;
        doc.moveTo(xValue + delta, yCord - 10)
            .lineCap('round')
            .lineTo(xValue + delta, yCord + 10)
            .lineWidth(2)
            .stroke();

        j++;
    } while (j <= period);

    var xValueText = 0;
    var diff = lineMax / period;
    var xValue = 0;
    var k = 0
    do {
        xValue = diff * k;
        xValueText = xValue + (diff / 2);
        doc.fontSize(12).fill('#218D88').text(monthArray[k], (xValueText + delta - 10), 220);
        k++;
    } while (k < period);
}

var color = ['#277F9B', '#218D88', '#8AB762', '#F2A131', '#800F65'];

function drawReleaseDateMarkers(doc, roadmapData, yCord, delta) {
    var count = 0;

    roadmapData.map(function (element, index) {
        if (count > 4) {
            count = 0;
        }
        var circleY;
        var textY;
        var clineY;
        if (index % 2 == 0) {
            circleY = yCord - 70;
            textY = yCord - 75;
            clineY = circleY + 15;
        } else {
            circleY = yCord + 70;
            textY = yCord + 65;
            clineY = circleY - 15;
        }

        doc.circle((element.x + delta), circleY, 18)
            .lineWidth(1)
            .fillAndStroke("#3377ff", "#000")

        doc.moveTo((element.x + delta), yCord)
            .lineTo((element.x + delta), clineY)
            .fill('#3377ff');

        doc.circle((element.x + delta), yCord, 6)
            .lineWidth(1)
            .fillAndStroke("#3377ff", "#000")

        var versionName = (element.endDate.getMonth() + 1) + '/' + parseInt(element.endDate.getUTCDate());
        doc.font('Helvetica-Bold', 8)
            .fillColor('white')
            .text("UDN: " + element.version + "\n   " + versionName, (element.x + 14), textY, {
                align: 'justify'
            });

        count++;
    });
}

function drawSummaries(doc, yCord, summaryArray, delta) {
    var versionCircleY = yCord + delta;
    var columnWidth = 65;
    var leftPadding = 30;
    var versionPadding = 22;
    var count = 0;

    summaryArray.map(function (element, index) {
        if (count > 4) count = 0;
        versionCircleY += 100;

        var yValue = versionCircleY + (15 * index);
        var versionNumber = element.version;
        if (yValue < 890) {
            doc.circle(leftPadding, versionCircleY, 15)
                .lineWidth(1)
                .fillAndStroke("#3377ff", "#000");
            doc.fontSize(12)
                .fillColor('white')
                .text(versionNumber, versionPadding, versionCircleY - 5);
        }
        element.description.map(function (element, index) {
            var yValue = versionCircleY + (15 * index);
            if (yValue > 790) {
                columnWidth = 385;
                leftPadding = 350;
                versionPadding = 342;
                versionCircleY = 330;
                yValue = versionCircleY;

                doc.circle(leftPadding, versionCircleY, 15)
                    .lineWidth(1)
                    .fillAndStroke("#3377ff", "#000")
                doc.fillColor('white')
                    .text(versionNumber, versionPadding, versionCircleY - 5);
            }
            doc.font('Helvetica-Bold', 12)
                .fillColor('#3377ff')
                .text("o " + element, columnWidth, (yValue - 15));
        })
        count++;
    })
}

function daysInMonth(date) {
    return new Date(date.getYear(),
        date.getMonth() + 1,
        0).getDate();
}

function convertDataArray(dataArray, session, year) {
    var roadmapDataArray = [];
    var versionsArray = [];
    var period = 6;
    if (session == 0) {
        period = 12;
    }

    dataArray.map(function (element, index) {
        var version_name = element.name;
        var endDate = new Date(element.end_time);

        if (session === 1 && endDate.getMonth() > 5) {
            return;
        }
        else if (session === 2 && endDate.getMonth() < 6) {
            return;
        }

        if (!versionsArray.includes(version_name)) {
            versionsArray.push(version_name);
            dataArray.map(function (value, index) {
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

            if (session == 1 && month > 5) {
                return;
            } else if (session == 2) {
                if (month < 6) {
                    return;
                }
                month = month - 6
            }

            if (period === 6) {
                xCord = (day * (90 / days_in_month)) + (month * 90);
            } else {
                xCord = (day * (45 / days_in_month)) + (month * 45);
            }

            var data = {
                'version': element.number,
                'version_name': version_name,
                'endDate': endDate,
                'x': (xCord),
                'y': 150
            }

            if (new Date(element.end_time).getFullYear() == year) {
                roadmapDataArray.push(data);
            }
        }
    });

    return roadmapDataArray;
}

function getSummaries(summaryArray) {
    var contentDescription = [];
    var versionArray = [];
    var capbilitiersArray = [];

    summaryArray.sort(function (value1, value2) {
        var date1 = new Date(value1.end_time);
        var date2 = new Date(value2.end_time);
        return (date1.getTime() - date2.getTime());
    });

    summaryArray.map(function (element, index) {
        var version = element.number.toFixed(1);
        var description = [];


        if (!versionArray.includes(version)) {
            summaryArray.map(function (value, index) {
                if (version === value.number.toFixed(1)) {
                    if (value.capabilities) description.push(value.capabilities);
                }
            });
            versionArray.push(version);
            contentDescription.push(description);
            var obj = {
                'version': version,
                'description': description
            }
            capbilitiersArray.push(obj);
        }
    });
    return capbilitiersArray;
}

