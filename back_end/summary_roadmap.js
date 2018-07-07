exports.init = function (app, db) {
    var app = app;

    app.post('/saveReleaseSprintTime', function (req, res) {
        var requestData = req.body.data;

        var queryArray = [];
        requestData.map(function (data) {
            var phase_id = getPhaseId(data.phase_name);
            var query = "INSERT INTO release_timeschedule (version_id, phase_id, start_time, end_time) " +
                "SELECT " + data.version_id + "," + phase_id + "," + "'" + data.start_time + "'" + "," + "'" + data.end_time + "' " +
                "WHERE NOT EXISTS(SELECT 1 FROM release_timeschedule WHERE version_id =" + data.version_id + " and phase_id=" + phase_id + "); ";
            queryArray.push(query);
        });


        queryArray.map(function (query, index) {
            db.run(query, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    if (index == (queryArray.length - 1)) res.send("success");
                }
            });

        })
    });
    app.post('/deleteTimeScheduleFeature', function (req, res) {
        var requestData = req.body;
        var versionNumber = requestData.version_id;
        var versionString = "";
        versionNumber.map(function (data) {
            versionString += "v.number = "+data+" or ";
        });
        versionString = versionString.slice(0,versionString.length-3);

        var query = "DELETE r FROM release_summery r INNER JOIN version v on r.version_id = v.version_id  WHERE "+ versionString +" and r.release_features='"+ requestData.elementName+"'";
        db.run(query, function (err) {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send("success");
            }
        });
    });


    app.get('/get_development_chartlayout', function (req, res) {

        var versionID = req.query["version_id"];
        getChartType(versionID, res, function (chartTypeArray) {

            if (chartTypeArray.length == 0) {
                res.send([]);
            }
            var chartTypeAndKPIArray = new Array;
            chartTypeArray.map(function (dict, index) {

                db.all("select title, achieved, remaining, goal, tab_type from development where version_id=" + versionID + " and chartType='" + dict.chartType + "' and achieved + remaining + goal <> 0.0", function (err, rows) {
                    if (err) {
                        res.send("Internal Error");
                    } else {
                        if (rows.length > 0) {
                            chartTypeAndKPIArray.push({chartType: dict.chartType, chartKPI: rows})
                        }
                        // res.send(rows);
                        if (chartTypeArray.length == (index + 1)) {
                            res.send(chartTypeAndKPIArray)
                        }
                    }
                });

            });

        });
    });

    app.post("/updateReleaseTimeSchedule",function(req,res){
        var body = req.body;
        var verNumberNamearray = body.version_name.split(" ");
        var verNumber = verNumberNamearray[1]
        var version_name=body.version_name;
        var bodyStr = JSON.stringify(body.data);
        var releaseTimeSchedule_procedureSQL =  "CALL releaseTimeSchedule_procedure(?,?,?)";
        db.run(releaseTimeSchedule_procedureSQL,[bodyStr,verNumber,version_name], function (err, rows) {
            if(err){
                res.status(400).send(err)
            }
            else{
                res.sendStatus(201);
            }

        })


    });


};

function getPhaseId(phase_name) {
    if (phase_name === 'Sprint Planning User Stories') return 1;
    if (phase_name === 'Sprint Planning – Dev') return 2;
    if (phase_name === 'Sprinting - Development') return 3;
    if (phase_name === 'QA execution') return 4;
    if (phase_name === 'Deployment to Staging') return 5;
    if (phase_name === 'Deployment to Production') return 6;

    return 0;

}