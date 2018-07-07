exports.init = function (app, db) {

    var fs = require('fs');
    var request = require('request');
    var https = require('https');
    var http = require('http');

    app.get('/get_development_chartlayout', function (req, res) {

        var versionID = req.query["version_id"];
        getChartType(versionID, res, function (chartTypeArray) {

            if (chartTypeArray.length == 0) {
                res.send([]);
            }
            var chartTypeAndKPIArray = new Array;
            chartTypeArray.map(function (dict, index) {

                try{
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
                }catch(e){
                    console.log(e);
                }
            })
        });
    });


    function getChartType(versionID, res, callback) {
        try{
            db.all("select distinct chartType from development where version_id='" + versionID+"'", function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    callback(rows)
                }
            });
        }catch(e){
            console.log(e);
        }

    }


    app.get('/get_development_dailysummary', function (req, res) {
        var versionID = req.query["version_id"];
        try{
            db.all(" select b.first_name || ' ' || b.last_name as name, dailysummary_id, summary_date,title,(substr(summary_contentText ,1,200) || '...' ) as summary_contentText\
            from dailysummary a inner join Login b on (a.user_name = b.user_name) where title <> '' and version_id=" + versionID, function (err, rows) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(rows);
                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/get_udn_roadmap', function (req, res) {
        try{
            db.all("select b.id, a.type,b.roadmap_type_id, c.name,b.roadmap_name_id, DATE_FORMAT(b.end_date, '%Y-%m-%d') as end_date, \n" +
                "CONCAT('[',GROUP_CONCAT('\"',b.feature,'\"' SEPARATOR ', '),']') as feature,\n" +
                "CONCAT('[',GROUP_CONCAT('{\"feature\": \"',b.feature,'\",\"id\":',b.id,'}' SEPARATOR ', '),']') as featureWithId\n" +
                "  from roadmap_type a INNER JOIN roadmap b\n" +
                "on (a.id=b.roadmap_type_id)\n" +
                "INNER JOIN roadmap_name c\n" +
                "on (c.id=b.roadmap_name_id)\n" +
                "GROUP BY b.roadmap_name_id;\n", function (err, rows) {

                if (err) {
                    res.send(err);
                } else {
                    rows.filter((element,index,array)=>{
                        element.feature = JSON.parse(element.feature);
                        element.featureWithId = JSON.parse(element.featureWithId);
                        array[index]= element;
                    })
                    res.send(rows);
                }
            });
        }catch(e){
            console.log(e);
        }

    });


    app.get('/get_development_dailysummary_by_id', function (req, res) {
        var dailysummary_id = req.query["dailysummary_id"];

        try{
            db.all(" select dailysummary_id, summary_date,title,summary_content ,\
            case when rowid = 1 then 1 else 0 end as show\
            from dailysummary where dailysummary_id=" + dailysummary_id, function (err, rows) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(rows);
                }
            });
        }catch(e){
            console.log(e);
        }

    });


    app.get('/CMS/DevelopmentCMS_KPI', function (req, res) {
        res.sendFile('./client/CMS/DevelopmentCMS_KPI.html', {
            root: __dirname
        })
    });

    app.get('/CMS/NewsEditor/DailySummary', function (req, res) {
        res.sendFile('./client/CMS/NewsEditor/index.html', {
            root: __dirname
        })
    });

    app.get('/BlogComment', function (req, res) {
        res.sendFile('./client/blogcomment.html', {
            root: __dirname
        })
    });


    app.get('/get_development_kpi_cms', function (req, res) {

        var versionID = req.query["version_id"];
        var chartTypeAndKPIArray = new Array;
        getChartType(versionID, res, function (chartTypeArray) {
            //console.log(chartArray);

            chartTypeArray.map(function (dict, index) {

                try{
                    db.all("select development_id, title, achieved, remaining, goal,sequence_number from development where version_id='" + versionID + "'' and chartType='" + dict.chartType + "'", function (err, rows) {
                        if (err) {
                            console.log(err);
                            res.send("Internal Error");
                        } else {

                            chartTypeAndKPIArray.push({chartType: dict.chartType, chartKPI: rows});

                            if (chartTypeArray.length == (index + 1)) {

                                res.send(chartTypeAndKPIArray)
                            }
                        }
                    });
                }catch(e){
                    console.log(e);
                }


            })

        })


    });


    app.get('/delete_development_kpi_cms', function (req, res) {
        var development_id = req.query["development_id"];
        try{
            db.run("delete from development where development_id =" + development_id, function (err, rows) {
                if (err) {
                    res.send("Internal Error");
                } else {
                    res.send("Deleted");
                }
            });
        }catch(e){
            console.log(e);
        }


    });


    app.get('/delete_blog_comment', function (req, res) {
        var comment_id = req.query["comment_id"];

        try{
            db.run("delete from Comment where comment_id =" + comment_id, function (err, rows) {
                if (err) {
                    res.send("Internal Error");
                } else {
                    res.send("Deleted");
                    db.run("delete from Comment where parent_comment_id =" + comment_id, function (err, rows) {
                        if (err) {
                            //res.send("Internal Error");
                        } else {
                            //res.send("Deleted");
                        }
                    });
                }
            });
        }catch(e){
            console.log(e);
        }
    });

    app.post('/insert_development_kpi_cms', function (req, res) {

        var version_id = req.body["version_id"];
        var title = req.body["title"];
        var chartType = req.body["chartType"];
        var achieved = 0;
        var remaining = 0;
        var goal = 0;
        var sequence_number = 1;
        if (!version_id || !title) {

            res.send("Invalid query");
            return;
        }

        try{
            db.run("INSERT INTO development(title ,version_id,achieved , remaining, goal, sequence_number,chartType) VALUES(?,?,?,?,?,?,?)", [title, version_id, achieved, remaining, goal, sequence_number, chartType], function (err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send("Added");
                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.post('/update_development_kpi_cms', function (req, res) {

        var development_id = req.body["development_id"];
        var title = req.body["title"];
        var achieved = req.body["achieved"];
        var remaining = req.body["remaining"];
        var goal = req.body["goal"];
        var sequence_number = req.body["sequence_number"];
        if (!development_id || !title || !achieved || !remaining || !goal || !sequence_number) {

            res.send("Invalid query");
            return;
        }

        try{
            db.run("UPDATE development SET title = ?, achieved = ? , remaining = ? , goal = ?, sequence_number = ? WHERE development_id = ?", [title, achieved, remaining, goal, sequence_number, development_id], function (err) {
                if (err) {
                    res.send(err);
                } else {
                    res.send("updated");
                }
            });
        }catch(e){
            console.log(e);
        }

    });


    app.post('/insert_update_KPIChart_excel_cms', function (req, res) {

        var chartData = req.body["chartData"];
        var version_id = req.body["version_id"];

        try{
            db.run("BEGIN");
            chartData.forEach(function (dict) {
                db.run("REPLACE INTO DEVELOPMENT (version_id,title,sequence_number,achieved,remaining,goal,chartType) VALUES (?, ?, ?, ?, ?, ?,?)", [version_id, dict.title, 1, dict.achieved, dict.remaining, dict.goal, dict.chartType],
                    function (err) {
                        if (err) {
                            console.log(err);
                        }
                    }
                );
            });
            db.run("COMMIT", function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.send("Uploaded");
                }
            });
        }catch(e){
            console.log(e);
        }

    });
    app.post('/insert_update_dailysummary_cms', function (req, res) {

        var version_id = req.body["version_id"];
        var summary_date = req.body["summary_date"];
        var summary_content = req.body["summary_content"];
        var summary_contentText = req.body["summary_contentText"];
        var daily_summary_id = req.body["daily_summary_id"];
        var title = req.body["title"];
        var user_name = req.session.username;

        var sequence_number = 1;
        if (!summary_date || !summary_content) {

            res.send("Invalid query");
            return;
        }

        if (daily_summary_id == 0) {

            try{
                db.run("INSERT INTO dailysummary(version_id ,summary_date,title,summary_content,summary_contentText,user_name) VALUES(?,?,?,?,?,?)", [version_id, summary_date, title, summary_content, summary_contentText, user_name], function (err) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send("Added");
                    }
                });
            }catch(e){
                console.log(e);
            }

        }
        else {
            try{
                db.run("UPDATE dailysummary set summary_date = ? ,title=?, summary_content = ?, summary_contentText = ?, user_name = ? where dailysummary_id= ?", [summary_date, title, summary_content, summary_contentText, user_name, daily_summary_id], function (err) {
                    if (err) {
                        res.send("update " + err);
                    } else {
                        res.send("Updated");
                    }
                });
            }catch(e){
                console.log(e);
            }

        }
    });

    app.get('/get_comment_dailysummary_id', function (req, res) {

        var dailysummary_id = req.query["dailysummary_id"];
        try{
            db.all("select (first_name || '  ' || last_name) as profileName,(a.user_name || '.'|| a.ext) as profilePicName,a.ext as ext, comment_id,a.user_name,dailysummary_id,parent_comment_id,commentText,strftime('%m/%d/%Y %H:%M:%S', commentDate) as lastTimeStamps \
            from Login a inner join Comment b on (a.user_name =b.user_name)  where dailysummary_id=" + dailysummary_id + " and parent_comment_id is null order by commentDate desc", function (err, rows) {
                if (err) {
                    res.send("Internal Error");
                } else {
                    res.send(rows);
                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/get_comment_exists_for_parent', function (req, res) {

        var dailysummary_id = req.query["dailysummary_id"];
        var parent_comment_id = req.query["comment_id"];
        var query = "SELECT EXISTS(SELECT 1 FROM Comment WHERE dailysummary_id =" + dailysummary_id + " and  parent_comment_id =" + parent_comment_id + " and parent_comment_id is not  null LIMIT 1) as 'check'";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    res.send("Internal Error");
                } else {
                    res.send(rows);
                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/get_comment_parent_comment_id', function (req, res) {

        var parent_comment_id = req.query["parent_comment_id"];
        try{
            db.all("select (first_name || '  ' || last_name) as profileName,(a.user_name || '.'|| a.ext) as profilePicName,a.ext as ext, comment_id,a.user_name,dailysummary_id,parent_comment_id,commentText,strftime('%m/%d/%Y %H:%M:%S', commentDate) as lastTimeStamps \
            from Login a inner join Comment b on (a.user_name =b.user_name)  where parent_comment_id=" + parent_comment_id + " order by commentDate desc", function (err, rows) {
                if (err) {
                    res.send("Internal Error");
                } else {
                    res.send(rows);
                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.post('/postComment', function (req, res) {

        try {

            var bodyMessage = req.body;
            var commentText = bodyMessage.commentText;
            commentText = commentText.replace("'", "''")
            var dailysummary_id = bodyMessage.dailysummary_id;
            var parent_comment_id = bodyMessage.parent_comment_id;
            var user_name = req.session.username;
            var queryStr = '';
            if (dailysummary_id && parent_comment_id == null) {
                queryStr = "Insert into Comment(user_name,dailysummary_id, commentText) values('" + user_name + "'," + dailysummary_id + ",'" + commentText + "')";
            }
            else if (dailysummary_id && parent_comment_id) {
                queryStr = "Insert into Comment(user_name,dailysummary_id, commentText,parent_comment_id) values('" + user_name + "'," + dailysummary_id + ",'" + commentText + "'," + parent_comment_id + ")";
            }

            try{
                db.run(queryStr, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        res.send("comment posted");
                    }
                });
            }catch(e){
                console.log(e);
            }

        }
        catch (e) {
            console.log(e);
        }
        finally {

        }
    });

    app.get('/getReleaseVersion', function (req, res) {
        var query = "Select * from version";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    // console.log(rows);
                    res.send({rows: rows});
                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/getReleaseSummery', function (req, res) {
        var versionName = req.query['versionName'];
        var query = "Select * from release_summery as a \
           inner join version as b on (a.version_id = b.version_id) where b.name ='" + versionName + "'";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    // console.log(rows);
                    res.send({rows: rows});
                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/getReleaseScope', function (req, res) {
        var query = "Select * from release_scope as a \
           inner join version as b on (a.version_id = b.version_id) \
           inner join module as c on (a.module_id = c.module_id)";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.send({rows: rows});
                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/getReleaseTime', function (req, res) {
        var versionName = req.query['versionName'];
        var query = "Select a.version_id, a.start_time, a.end_time, a.actual_end_time, a.phase_id,a.time_id, c.phase_name,b.name from release_timeschedule as a \
           inner join version as b on (a.version_id = b.version_id) \
           inner join release_phase as c on (a.phase_id = c.phase_id)\
           where b.number ='" + versionName + "' ORDER BY c.phase_order";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    //console.log(rows);
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });

    app.get('/getActuslReleaseTime', function (req, res) {
        var query = "Select * from release_actualenddate as a \
           inner join version as b on (a.version_id = b.version_id)";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    // console.log(rows);
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }
    });

    app.get('/getfaultFount', function (req, res) {
        var query = "Select * from faults_found as a \
           inner join version as b on (a.version_id = b.version_id)\
           inner join module as c on (a.module_id = c.module_id)\
           ";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    // console.log(rows);
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });

    app.post('/updateReleaseSummery', function (req, res) {
        var body = req.body;

        res.send();


        let versions = [];
        let params = [];

        //iterate through all versions
        body.map (function (data) {
            if (data['version_id'] && data['description']) {
                versions.push(data['version_id']);
                //iterate through all descriptions (several rows have been edited).
                descriptions = data['description'];
                descriptions.map(function(desc) {
                    if (desc != "") {
                        params.push([data['version_id'], desc]);
                    }
                });
            }
        });


        // Delete whatever was there for this particular version. We are going to update with new descriptions.
        //TODO this is a wrong way of editing data. The front-end should be corrected as well.
        //TODO There should be a "summary_id" that identifies what should be updated, what should be deleted
        //TODO otherwise, it should be added as a new one
        try{
            db.transactionQuery("DELETE FROM  release_summery where (version_id) in (?)", [versions], function (args) {
                if (args) {
                    console.log(args);
                }


                //bulk insert query
                let query = "INSERT INTO release_summery (version_id, release_features) VALUES ?";

                db.transactionQuery(query, [params], function (args) {
                    if (args) {
                        console.log("Transaction done - message: " + args);
                    }
                });

            });
        }catch(e){
            console.log(e);
        }
    });

    //addTheme service

    app.post('/addTheme', function (req, res) {
        var body1 = req.body;
        //console.log('body1'+body1);
        var arrayQueue = [];
        var query1 = '';
        body1.map(function (data, index) {
            /*var query = "INSERT INTO release_scope (version_id,module_id,release_theme,capabilities,description)SELECT "+'+v.version_id+',"'+m.module_id'"+,'"+data.release_theme+"','"+data.feature+"','"+data.description+"'\
                FROM module m,version v \
                WHERE m.module_name = '"+data.module_name+"' AND v.version_id = '"+data.version_id+"'";
 */
            var query = "INSERT into release_scope (version_id,module_id,release_theme,capabilities,description)\
                    SELECT v.version_id,m.module_id, '" + data.release_theme + "','" + data.feature + "','" + data.description + "'\
                        FROM module m,version v \
                        WHERE m.module_name = '" + data.module_name + "' AND v.version_id = " + data.version_id;

            arrayQueue.push(query);
        });

        if (arrayQueue.length > 0) {
            query1 = arrayQueue[0];
            processAtDatabase(db, arrayQueue, query1, res);
        }

    });


    function processAtDatabase(db, arrayQuery, query, res) {
        // console.log("arrayQuery:"+JSON.stringify(arrayQuery));
        // console.log("Query:"+JSON.stringify(query));
        try{
            db.run(query, function (err) {
                arrayQuery.shift();
                if (arrayQuery.length > 0) {
                    // console.log("arraylength:"+arrayQuery.length);
                    query = arrayQuery[0];
                    processAtDatabase(db, arrayQuery, query, res);
                }
                else {
                    res.send("success");
                }

                if (err) {
                    console.log(err);
                } else {
                    //res.send("success");
                }
            });
        }catch(e){
            console.log(e);
        }
    }


    /*Welcome*/

    app.post('/addFeature', function (req, res) {
        let body2 = req.body;
        // console.log(body2);

        var arrayQueue = [];
        var query1 = '';
        body2.map(function (data, index) {
            // "INSERT INTO version (name,number,date,type)\
            //             VALUES ('"+body.name+"','"+body.number+"','"+body.date+"','"+body.type+"')\
            //             ";

            var query = "REPLACE INTO release_summery(summery_id,version_id,release_features) " +
                "VALUES (" + data.summary_id + "," + data.version_id + ",'" + data.release_feature + "')";
            arrayQueue.push(query);
        });

        if (arrayQueue.length > 0) {
            query1 = arrayQueue[0];
            processFeaturesAtDatabase(db, arrayQueue, query1, res);
        }


    });


    function processFeaturesAtDatabase(db, arrayQuery, query, res) {
        // console.log("arrayQuery:"+JSON.stringify(arrayQuery));
        // console.log("Query:"+JSON.stringify(query));
        try{
            db.run(query, function (err) {
                arrayQuery.shift();
                if (arrayQuery.length > 0) {
                    query = arrayQuery[0];
                    processAtDatabase(db, arrayQuery, query, res);
                }
                else {
                    res.send("success");
                }

                if (err) {
                    console.log(err);
                } else {
                    //res.send("success");
                }
            });
        }catch(e){
            console.log(e);
        }
    }


    /**/


    app.post('/addSummeryRow', function (req, res) {
        var body = {
            "summery_id": req.body[0].value == '' ? null : req.body[0].value,
            "name": req.body[1].value,
            "release_features": req.body[2].value,
        };
        var query = "REPLACE INTO release_summery (summery_id,version_id,release_features)\
                        SELECT " + body.summery_id + ",v.version_id,'" + body.release_features + "' \
                        FROM version v\
                        WHERE v.name = '" + body.name + "'";

        try{
            db.run(query, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.send("success");
                }
            })
        }catch(e){
            console.log(e);
        }

    });


    app.post('/addScopeRow', function (req, res) {
        var body = {
            "scope_id": req.body[0].value == '' ? null : req.body[0].value,
            "name": req.body[1].value,
            "module_name": req.body[2].value,
            "release_theme": req.body[3].value,
            "capabilities": req.body[4].value,
            "description": req.body[5].value
        };
        var query = "REPLACE INTO release_scope (scope_id,version_id,module_id,release_theme,capabilities,description)\
                        SELECT '" + body.scope_id + "',v.version_id, m.module_id,'" + body.release_theme + "','" + body.capabilities + "','" + body.description + "' \
                        FROM version v,module m \
                        WHERE v.name = '" + body.name + "' AND \
                        m.module_name = '" + body.module_name + "'";
        // console.log(query);
        try{
            db.run(query, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.send("success");
                }
            })
        }catch(e){
            console.log(e);
        }

    });

    app.post('/addTimeRow', function (req, res) {
        var body = {
            "time_id": req.body[0].value == '' ? null : req.body[0].value,
            "name": req.body[1].value,
            "phase_name": req.body[2].value,
            "start_time": req.body[3].value,
            "end_time": req.body[4].value
        };
        var bodyName = body.name.replace("UDN", "Release");
        var query = "REPLACE INTO release_timeschedule (time_id,version_id,phase_id,start_time,end_time)\
                        SELECT " + body.time_id + ",v.version_id, p.phase_id,'" + body.start_time + "','" + body.end_time + "'\
                        FROM version v,release_phase p \
                        WHERE v.name = '" + bodyName + "' AND \
                        p.phase_name = '" + body.phase_name + "'";

        try{
            db.run(query, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.send("success");
                }
            })
        }catch(e){
            console.log(e);
        }

    });

    app.post('/addActualEndTime', function (req, res) {
        var body = {
            "time_id": req.body[0].value == '' ? null : req.body[0].value,
            "name": req.body[1].value,
            "actual_end_time": req.body[2].value
        };

        var query = "REPLACE INTO release_actualenddate (time_id,version_id,actual_end_time)\
                        SELECT " + body.time_id + ",v.version_id,'" + body.actual_end_time + "'\
                        FROM version v \
                        WHERE v.name = '" + body.name + "'";

        // console.log(query);
        try{
            db.run(query, function (err) {
            if (err) {
                console.log(err);
            } else {
                res.send("success");
            }
        })
        }catch(e){
            console.log(e);
        }

    });

    app.post('/addFaultsFound', function (req, res) {
        var body = {
            "fault_id": req.body[0].value == '' ? null : req.body[0].value,
            "name": req.body[1].value,
            "module_name": req.body[2].value,
            "fault_found": req.body[3].value,
        };
        var query = "REPLACE INTO faults_found (fault_id,version_id,module_id,fault_found)\
                        SELECT " + body.fault_id + ",v.version_id, m.module_id,'" + body.fault_found + "' \
                        FROM version v,module m \
                        WHERE v.name = '" + body.name + "' AND \
                        m.module_name = '" + body.module_name + "'";
        // console.log(query);
        try{
            db.run(query, function (err) {
            if (err) {
                console.log(err);
            } else {
                res.send("success");
            }
        })
        }catch(e){
            console.log(e);
        }

    });

    app.post('/addVersionRow', function (req, res) {
        var body = {
            "version_id": req.body[0].value == '' ? null : req.body[0].value,
            "name": req.body[1].value,
            "number": req.body[2].value,
            "date": req.body[3].value,
            "type": req.body[4].type
        };
        if (req.body[0].value != '') {
            var query = "Update version SET name='" + body.name + "',number='" + body.number + "',date='" + body.date + "',type='" + body.type + "' Where version_id='" + body.version_id + "'";
        } else {

            var query = "INSERT INTO version (name,number,date,type)\
                        VALUES ('" + body.name + "','" + body.number + "','" + body.date + "','" + body.type + "')\
                        ";
        }

        // console.log(query);
        try{
            db.run(query, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.send("success");
                }
            })
        }catch(e){
            console.log(e);
        }

    });


    app.get('/deleteVersionRow', function (req, res) {
        var version_id = req.query["version_id"];
        try{
            db.run("delete from release_summery where version_id =" + version_id, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.send("success");

                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/deleteSummeryRow', function (req, res) {
        var summery_id = req.query["summery_id"];
        try{
            db.run("delete from release_summery where summery_id =" + summery_id, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send("success");

                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/deleteScopeRow', function (req, res) {
        var scope_id = req.query["scope_id"];
        try{
            db.run("delete from release_scope where scope_id =" + scope_id, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send("success");

                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/deleteTimeRow', function (req, res) {
        var time_id = req.query["time_id"];
        try{
            db.run("delete from release_timeschedule where time_id =" + time_id, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send("success");

                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/deleteActualEndTime', function (req, res) {
        var time_id = req.query["time_id"];
        try{
            db.run("delete from release_actualenddate where time_id =" + time_id, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send("success");

                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/deletefaultfound', function (req, res) {
        var fault_id = req.query["fault_id"];
        try{
            db.run("delete from faults_found where fault_id =" + fault_id, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send("success");

                }
            });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/getReleaseScopeByVersion', function (req, res) {
        var version_id = req.query["version_id"];
        var query = "Select * from release_scope as a \
           inner join version as b on (a.version_id = b.version_id) \
           inner join module as c on (a.module_id = c.module_id) \
           where a.version_id =" + version_id + " " +
            "and a.description != 'unavailable' " +
            "and a.description NOT like '%N/A - %' " +
            "and a.description NOT like '%NA - %' " +
            "and a.description != 'NA' " +
            "AND a.description != '-' " +
            "and a.description is not null  " +
            "and a.description <> \"\" " +
            "and a.release_theme <> \"\"";

        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });

    app.get('/getAllModules', function (req, res) {
        let query = "SELECT module_name FROM module ";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });

    app.get('/getAllThemes', function (req, res) {
        var query = "Select distinct(release_theme) from release_scope where release_theme <> \"\"";

        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });
    app.get('/getReleasePhaseList', function (req, res) {
        var query = "SELECT * FROM release_phase ORDER by phase_order";

        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }


    })

    app.get('/deleteRelease', function (req, res) {
        var number = req.query["version_id"];
        var query = "Select * FROM version WHERE number=" + number + " AND type='dev'";

        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    if (rows && rows.length > 0) {
                        var version = rows[0].version_id;
                        var queryArray = [];
                        queryArray.push('DELETE FROM release_timeschedule where version_id=' + version);
                        queryArray.push('DELETE FROM release_summery where version_id=' + version);
                        queryArray.push('DELETE FROM release_scope where version_id=' + version);
                        queryArray.push('DELETE FROM feature_version where version_id=' + version);
                        queryArray.push('DELETE FROM faults_found where version_id=' + version);
                        queryArray.push('DELETE FROM development where version_id=' + version);
                        queryArray.push('DELETE FROM version where version_id=' + version);

                        queryArray.map(function (query) {
                            db.run(query, function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                        res.send('success');
                    } else {
                        res.send('This Version has release dependency.')
                    }
                }
            })
        }catch(e){
            console.log(e);
        }
    })

    app.get('/getTimeSchedule', function (req, res) {
        var version_id = req.query["version_id"];
        var query = "Select b.name, b.number, a.version_id, c.phase_name, c.phase_order, a.phase_id, a.time_id, a.start_time, a.end_time, a.actual_end_time from release_timeschedule as a \
           inner join version as b on (a.version_id = b.version_id) \
           inner join release_phase as c on (a.phase_id = c.phase_id) \
           where a.version_id =" + version_id + " ORDER by c.phase_id";

        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }


    })


    app.get('/getTimeScheduleMul', function (req, res) {
        var version_ids = req.query["version_id"];
        var query = "Select b.name, b.number, a.version_id, c.phase_name, c.phase_order, a.phase_id, a.time_id, a.start_time, a.end_time, a.actual_end_time from release_timeschedule as a \
           inner join version as b on (a.version_id = b.version_id) \
           inner join release_phase as c on (a.phase_id = c.phase_id) \
           where a.version_id in (" + version_ids + ") ORDER by a.version_id, c.phase_id";

        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }

            })
        }catch(e){
            console.log(e);
        }


    })

    app.get('/getAllVersions', function (req, res) {
        var query = "Select CONVERT(cast(number as decimal(4,1)), CHAR CHARACTER SET utf8) as name from version";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    })

    app.get('/getStatusType', function (req, res) {
        var query = "Select * from status_types ";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });

    app.get('/getAllReleasePhase', function (req, res) {
        var query = "Select phase_name from release_phase ORDER by phase_order";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });

    app.get('/getRoadmapData', function (req, res) {
        var versions = req.query['versions'];
        versions = versions.replace(/,/gi,"','");
        var query = "Select a.start_time,a.version_id, a.end_time,a.actual_end_time ,b.name, CONVERT(cast(b.number as decimal(4,1)), CHAR CHARACTER SET utf8) as number from release_timeschedule as a\
        inner join version as b on (a.version_id = b.version_id)\
        where a.phase_id = 7 and b.name in ("+versions+")";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });

    app.get('/getReleaseDashboardVersion', function (req, res) {
        let version_id= req.query["version_id"];
        let query =   "select * from release_summery where version_id ="+version_id;

        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });

    app.post('/roadmap', function (req, res) {

        var body=req.body;
        var bodyStr=JSON.stringify(body);
        var roadmap_procedureSQL =  "CALL roadmap_procedure(?)";
        db.run(roadmap_procedureSQL,[bodyStr], function (err, rows) {
            if(err){
                res.status(400).send(err)
            }
            else{
                res.sendStatus(201);
            }

        })

    });

    app.delete('/roadmapFeature', function (req, res) {

        var featureId = req.query["featureId"];
        var roadmapSQL =  "Delete from Roadmap where id=?";
        db.run(roadmapSQL,[featureId], function (err, rows) {
            if(err){
                res.status(400).send(err)
            }
            else{
                res.sendStatus(200);
            }

        })

    });

    app.get('/getCapabilities', function (req, res) {
        var versions = req.query['versions'];
        versions = versions.replace(/,/gi,"','");

        var query = "Select a.version_id,a.start_time, a.end_time, b.name, CONVERT(cast(b.number as decimal(4,1)), CHAR CHARACTER SET utf8) as number, c.release_features as 'capabilities' from release_timeschedule as a \
        inner join version as b on (a.version_id = b.version_id)\
        inner join release_summery as c on (b.version_id = c.version_id) where b.name in ("+versions+") group by b.number,c.release_features";


        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});

                }

            })
        }catch(e){
            console.log(e);
        }

    });


    app.get('/getTimePlanData', function (req, res) {
        var version_year = req.query['year'];
        var query = "Select DISTINCT a.start_time, a.end_time, b.name, a.actual_end_time from release_timeschedule as a \n" +
            "        inner join version as b on (a.version_id=b.version_id)  where a.phase_id =6 and (a.start_time like '"+ version_year +"%' or a.end_time like '"+ version_year +"%' or a.actual_end_time like '"+ version_year +"%')"

            try{
                db.all(query, function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.send("Internal Error");
                    } else {
                        res.send({rows: rows});
                    }
                })
            }catch(e){
                console.log(e);
            }

    });

    app.get('/getQualityDataForSummery', function (req, res) {
        var versionArray = req.query['versionArray'];
        var moduleArray = req.query['moduleArray'];
        var year= req.query['year'];
        versionArray = JSON.parse(versionArray);
        moduleArray = JSON.parse(moduleArray);
        var newVersionArray = [];
        var newModuleArray = [];
        var urlLinkversionString = [];
        var versionIdString = "";
        var versionList=[];
        versionArray.map(function(version){
            versionIdString += " v.version_id="+version.version_id+" or ";

            if(version.number >= '2.0'){
                var num = parseFloat(version.number);
                if(version.number == '2.0'){
                    versionList.push('2.0');
                }else{
                    versionList.push(num);
                }
            }
        })

        versionIdString = versionIdString.substring(0, versionIdString.length - 3);

        var query = "Select v.name,SUM(f.fault_found) as count \
            from version as v,faults_found as f \
            where v.version_id = f.version_id and ("+versionIdString+") Group by  f.version_id";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    var versionString = "(";
                    rows.map(function (data) {
                        if (data.name.toUpperCase() != "SUMMARY") {
                            newVersionArray.push(data.name);
                            var release = data.name.split(" ");
                            var linkString = {
                                name: release[1],
                            }
                            if (release[1] == 1.5) {
                                versionString += "fixVersion =" + release[1] + ".0 OR fixVersion=" + release[1] + " OR fixVersion=" + release[1] + ".1 OR ";
                                linkString.link = "(fixVersion =" + release[1] + ".0 OR fixVersion=" + release[1] + " OR fixVersion=" + release[1] + ".1)"
                            } else {
                                versionString += "fixVersion =" + release[1] + ".0 OR fixVersion=" + release[1] + " OR ";
                                linkString.link = "(fixVersion =" + release[1] + ".0 OR fixVersion=" + release[1] + ")";
                            }
                            urlLinkversionString.push(linkString);
                        }
                    });

                    // console.log("link:"+ JSON.stringify(urlLinkversionString));
                    versionString = versionString.substring(0, versionString.length - 3);

                    versionString += ")";

                    var moduleString = "(";

                    moduleArray.map(function (data) {
                        moduleString += '"' + data + '",';
                    });

                    moduleString = moduleString.substring(0, moduleString.length - 1);
                    moduleString += ")";

                    var username = "rdaggolu";
                    var password = "ramesh1976";
                    var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
                    var request = require('request');
                    // var url = "https://vidscale.atlassian.net/rest/gadget/1.0/statistics?filterId=21204&statType=statuses&_=1500335680701";
                    var url = "https://jira.ericssonudn.net/rest/api/2/search?jql=project in " + moduleString + " AND " + versionString + "AND issuetype in (BUG, Problem)&fields=fixVersions,issuetype&maxResults=10000"
                    // url =url + pageStr

                    //console.log("url 0 ="+url);

                    var strText = "";
                    // console.log(url)
                    request.get({
                        url: url,
                        headers: {
                            "Authorization": auth
                        }
                    }, function (error, response, body) {
                        //console.log('body : ', body);
                        var jiraList = [];

                        newVersionArray.map(function (data) {
                            var vname = data.split(" ");
                            var url1 = null;
                            urlLinkversionString.map(function (dataLink) {
                                if (vname[1] == dataLink.name) {
                                    url1 = "https://jira.ericssonudn.net/issues/?jql=project in " + moduleString + " AND " + dataLink.link + " AND issuetype in (BUG, Problem)";
                                }
                            });
                            var jiraObj = {
                                name: vname[1],
                                count: 0,
                                bug: 0,
                                bugAfter: 0,
                                jiraLink: url1
                            };
                            jiraList.push(jiraObj);
                        });
                        // console.log("jiraList"+JSON.stringify(jiraList));
                        var jiraData = JSON.parse(body);
                        var jiraRequestArray = [];
                        // console.log(jiraData.total );
                        if (parseInt(jiraData.total) > 1000) {
                            // console.log(Math.floor(parseInt(jiraData.total)/1000));
                            for (var i = 1; i <= Math.floor(parseInt(jiraData.total) / 1000); i++) {
                                url = "https://jira.ericssonudn.net/rest/api/2/search?jql=project in " + moduleString + " AND " + versionString + "AND issuetype in (BUG, Problem)&fields=project,issuetype,fixVersions&maxResults=1000&startAt=" + ((i * 1000));
                                // console.log("url "+i+" ="+url);
                                request.get({
                                    url: url,
                                    headers: {
                                        "Authorization": auth
                                    }
                                }, function (error1, response1, body1) {

                                    var jiraDataCunk = JSON.parse(body1);
                                    jiraData.issues = jiraData.issues.concat(jiraDataCunk.issues);
                                    jiraRequestArray.shift();
                                    // console.log(jiraRequestArray.length);
                                    if (jiraRequestArray.length == 0) {
                                        //console.log(jiraData.issues.length);
                                        //console.log(JSON.stringify(jiraData));
                                        if (jiraData.issues) {
                                            jiraData.issues.map(function (data) {
                                                var vname = data.fields.fixVersions[0].name;
                                                var slicedname = vname.substring(0, 3);
                                                jiraList.map(function (versionData, index) {
                                                    //console.log(versionData.name +"  "+ slicedname);
                                                    if (versionData.name == slicedname) {
                                                        jiraList[index].count = versionData.count + 1;
                                                        if (data.fields.issuetype.name.toUpperCase() == "BUG" || data.fields.issuetype.name.toUpperCase() == "PROBLEM") {
                                                            jiraList[index].bug = versionData.bug + 1;
                                                        }
                                                        /*else{
                                                                                                                    jiraList[index].dev = versionData.dev +1;
                                                                                                                }*/
                                                    }
                                                });
                                            });
                                        }


                                        jiraList.map(function (versionData, index) {
                                            rows.map(function (data) {
                                                var vname = data.name;
                                                var slicedname = vname.split(" ");
                                                if (versionData.name == slicedname[1]) {
                                                    jiraList[index].bugAfter = data.count;
                                                }
                                            })
                                        })

                                        // console.log(JSON.stringify(jiraList));
                                        // console.log(JSON.stringify(rows));


                                        var FinalArray = [];
                                        jiraList.map(function (jiraData) {
                                            rows.map(function (dbData) {
                                                var releaseNo = dbData.name.split(" ");
                                                if (releaseNo[1] == jiraData.name) {
                                                    var y = jiraData.count;
                                                    var x = dbData.count;
                                                    var fst = (x / (x + y)) * 100;
                                                    var tempObj = {
                                                        name: dbData.name,
                                                        quality: fst,
                                                        bug: jiraData.bug,
                                                        bugAfter: jiraData.bugAfter,
                                                        jiraLink: jiraData.jiraLink
                                                    }
                                                    FinalArray.push(tempObj);
                                                }
                                            });
                                        })

                                        console.log("hello");
                                        getBugOriginCountList(versionList,function (listData) {

                                            var submitList = FinalArray.concat(listData);
                                            res.send({rows: submitList});


                                        })

                                        // console.log("final:"+JSON.stringify(FinalArray));
                                        // res.send({rows:FinalArray});
                                    }
                                });
                                jiraRequestArray.push(url);
                                // console.log("jiraRequestArray"+jiraRequestArray.length);
                            }
                        } else {
                            if (jiraData.issues) {
                                jiraData.issues.map(function (data) {
                                    var vname = data.fields.fixVersions[0].name;
                                    var slicedname = vname.substring(0, vname.length - 2);
                                    jiraList.map(function (versionData, index) {
                                        if (versionData.name == slicedname) {

                                            jiraList[index].count = versionData.count + 1;
                                            if (data.fields.issuetype.name.toUpperCase() == "BUG" || data.fields.issuetype.name.toUpperCase() == "PROBLEM") {
                                                jiraList[index].bug = versionData.bug + 1;
                                            }
                                            /*else{
                                                                                         jiraList[index].dev = versionData.dev +1;
                                                                                         }*/

                                        }
                                    });
                                });
                            }

                            jiraList.map(function (versionData, index) {
                                rows.map(function (data) {
                                    var vname = data.name;
                                    var slicedname = vname.split(" ");
                                    if (versionData.name == slicedname[1]) {
                                        jiraList[index].bugAfter = data.count;
                                    }
                                })
                            })

                            // console.log("jira"+JSON.stringify(jiraList));
                            // console.log("rows"+JSON.stringify(rows));


                            var FinalArray = [];
                            jiraList.map(function (jiraData) {
                                rows.map(function (dbData) {
                                    var releaseNo = dbData.name.split(" ");
                                    if (releaseNo[1] == jiraData.name) {
                                        var y = jiraData.count;
                                        var x = dbData.count;
                                        var fst = (y / (x + y)) * 10;
                                        var tempObj = {
                                            name: dbData.name,
                                            quality: fst,
                                            bug: jiraData.bug,
                                            bugAfter: jiraData.bugAfter,
                                            jiraLink: jiraData.jiraLink
                                        }
                                        FinalArray.push(tempObj);
                                    }
                                });
                            })
                            getBugOriginCountList(versionList,function (listData) {
                                var submitList = FinalArray.concat(listData);
                                res.send({rows: submitList});

                            })
                            // console.log("final:"+JSON.stringify(FinalArray));

                        }

                    });

                }
            })
        }catch(e){
            console.log(e);
        }

    });

    function getBugOriginCountList(versionArray,callback) {
        var versionArray = versionArray;//["2.0", "2.1", "2.2"];
        var list = [];
        var username = "rdaggolu";
        var password = "ramesh1976";
        var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
        var request = require('request');
        var tempArray = [];
        var Prod = [];
        var notProd = [];
        // var url = "https://vidscale.atlassian.net/rest/gadget/1.0/statistics?filterId=21204&statType=statuses&_=1500335680701";

        versionArray.map(function (data) {

            var url = 'https://jira.ericssonudn.net/rest/api/2/search?jql= project in ("DO","CDX","Documentation","LB","MON","UDNP","CIS","CS","RelEng","AN") AND (fixVersion =' + data + ' OR fixVersion=' + data + '.0) AND ( "Bug Origin Environment" = Production )';
            //console.log(url)
            request.get({
                url: url,
                headers: {
                    "Authorization": auth
                }
            }, function (error, response, body) {
                var jiraData = JSON.parse(body);
                var proObj = {
                    count: jiraData.total,
                    version: data
                };
                var url1 = 'https://jira.ericssonudn.net/rest/api/2/search?jql= project in ("DO","CDX","Documentation","LB","MON","UDNP","CIS","CS","RelEng","AN") AND (fixVersion =' + data + ' OR fixVersion=' + data + '.0) AND ( "Bug Origin Environment" != Production )';
                //console.log(url1);
                request.get({
                    url: url1,
                    headers: {
                        "Authorization": auth
                    }
                }, function (error1, response1, body1) {
                    var jiraData1 = JSON.parse(body1);
                    //console.log(jiraData1.total);
                    var notProObj = {
                        count: jiraData1.total,
                        version: data
                    };
                    Prod.push(proObj);
                    notProd.push(notProObj);
                    if (Prod.length == versionArray.length && notProd.length == versionArray.length) {
                        var list = []

                        Prod.map(function (data, index) {
                            var y = data.count;
                            var x = notProd[index].count;
                            var fst = (y / (x + y)) * 10;
                            var tempObj = {
                                name: "Release " + data.version,
                                quality: fst,
                                bug: x,
                                bugAfter: y,
                                jiraLink: 'https://jira.ericssonudn.net/issues/?jql=project in ("DO","CDX","Documentation","LB","MON","UDNP","CIS","CS","RelEng","AN") AND (fixVersion =' + data.version + ' OR fixVersion=' + data.version + '.0) AND ( "Bug Origin Environment" = Production )',
                                jiraLink: 'https://jira.ericssonudn.net/issues/?jql=project in ("DO","CDX","Documentation","LB","MON","UDNP","CIS","CS","RelEng","AN") AND (fixVersion =' + data.version + ' OR fixVersion=' + data.version + '.0) AND ( "Bug Origin Environment" != Production )'
                            }
                            list.push(tempObj)


                        });
                        callback(list);
                    }
                });

            });


        });
    }

    app.get('/getQualityDataForRelease', function (req, res) {
        var versionArray = req.query['versionArray'];
        var moduleArray = req.query['moduleArray'];
        var year = req.query['year'];
        versionArray = JSON.parse(versionArray);

        moduleArray = JSON.parse(moduleArray);
        var releaseArray = versionArray[0].name.split(" ");
        if (releaseArray[1] >= "2.0" ) {
            getDistributedQuality(releaseArray[1], moduleArray, function (list) {
                res.send({rows: list});
            });
        } else {


            var newVersionArray = [];
            var newModuleArray = [];
            var versionString = "(";
            versionArray.map(function (data) {
                if (data.name.toUpperCase() != "SUMMARY") {
                    newVersionArray.push(data.name);
                    var release = data.name.split(" ");
                    if (release[1] == 1.5) {
                        versionString += "fixVersion =" + release[1] + ".0 OR fixVersion=" + release[1] + " OR fixVersion=" + release[1] + ".1 OR ";
                    } else {
                        versionString += "fixVersion =" + release[1] + ".0 OR fixVersion=" + release[1] + " OR ";
                    }
                }
            });

            versionString = versionString.substring(0, versionString.length - 3);

            versionString += ")";

            var moduleString = "(";

            moduleArray.map(function (data) {
                newModuleArray.push(data);
                moduleString += '"' + data + '",';
            });

            moduleString = moduleString.substring(0, moduleString.length - 1);
            moduleString += ")";

            var username = "rdaggolu";
            var password = "ramesh1976";
            var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
            var request = require('request');
            // var url = "https://vidscale.atlassian.net/rest/gadget/1.0/statistics?filterId=21204&statType=statuses&_=1500335680701";
            var url = "https://jira.ericssonudn.net/rest/api/2/search?jql=project in " + moduleString + " AND " + versionString + "AND issuetype in (BUG, Problem,Sub-task, task, 'technical task')&fields=project,issuetype&maxResults=1000"
            // url =url + pageStr


            var strText = "";
            // console.log(url)
            request.get({
                url: url,
                headers: {
                    "Authorization": auth
                }
            }, function (error, response, body) {
                // console.log('body : ', body);

                var jiraData = JSON.parse(body);
                var jiraRequestArray = [];
                if (jiraData.total > 1000) {

                    for (var i = 1; i <= Math.floor(jiraData); i++) {
                        url = "https://jira.ericssonudn.net/rest/api/2/search?jql=project in " + moduleString + " AND " + versionString + "AND issuetype in (BUG, Problem, Sub-task, task, 'technical task')&fields=project,issuetype&maxResults=1000&startAt=" + ((i * 1000) + 1);
                        request.get({
                            url: url,
                            headers: {
                                "Authorization": auth
                            }
                        }, function (error, response, body) {
                            var jiraDataCunk = JSON.parse(body);
                            jiraData.issues = jiraData.issues.concat(jiraDataCunk.issues);
                            jiraRequestArray.shift();
                            // console.log(jiraRequestArray.length);
                            if (jiraRequestArray.length == 0) {
                                var query = "Select m.module_name,SUM(f.fault_found) as count \
                                from  module as m inner join faults_found f on(m.module_id=f.module_id) \
                                inner join version v on (f.version_id=v.version_id) \
                                where f.version_id =" + versionArray[0].version_id + " \
                                Group by  m.module_id";

                                // console.log(query);
                                try{
                                    db.all(query, function (err, rows) {
                                        if (err) {
                                            console.log(err);
                                            res.send("Internal Error");
                                        } else {
                                            newModuleArray.map(function (data) {
                                                var urlLink = "https://jira.ericssonudn.net/issues/?jql=project in (" + data + ") AND " + versionString + "AND issuetype in (BUG, Problem, Sub-task, task, 'technical task')";
                                                var jiraObj = {
                                                    name: data,
                                                    count: 0,
                                                    bug: 0,
                                                    bugAfter: 0,
                                                    jiraList: urlLink
                                                };

                                                jiraList.push(jiraObj);
                                            });
                                            // console.log("jiraList"+JSON.stringify(jiraList));
                                            if (jiraData.issues) {
                                                jiraData.issues.map(function (data) {
                                                    var vname = data.fields.project.key;
                                                    // var slicedname = vname.substring(0,vname.length-2);
                                                    jiraList.map(function (moduleData, index) {
                                                        if (moduleData.name.toUpperCase() == vname.toUpperCase()) {
                                                            jiraList[index].count = moduleData.count + 1;
                                                            if (data.fields.issuetype.name.toUpperCase() == 'BUG' || data.fields.issuetype.name.toUpperCase() == 'PROBLEM') {
                                                                jiraList[index].bug = moduleData.bug + 1;
                                                            }
                                                            /*else{
                                                                                                                    jiraList[index].dev =moduleData.dev +1;
                                                                                                                }*/
                                                        }
                                                    });
                                                });
                                            }
                                            /*jiraList.map(function (moduleData,index) {
                                                rows.map(function (data){
                                                    if(moduleData.name.toUpperCase() == data.module_name.toUpperCase()){
                                                        if(versionData.name == slicedname[1]){
                                                        jiraList[index].bugAfter =  data.count;
                                                    }
                                                })
                                            })*/

                                            // console.log(JSON.stringify(jiraList));
                                            // console.log(JSON.stringify(rows));

                                            var FinalArray = [];
                                            jiraList.map(function (jiraData) {
                                                rows.map(function (dbData) {
                                                    if (dbData.module_name.toUpperCase() == jiraData.name.toUpperCase()) {
                                                        var y = jiraData.count;
                                                        var x = dbData.count;
                                                        var fst = ((x) / (x + y)) * 100;
                                                        var tempObj = {
                                                            name: dbData.module_name,
                                                            quality: fst,
                                                            bug: jiraData.bug,
                                                            bugAfter: dbData.count,
                                                            jiraLink: jiraData.jiraList
                                                        }
                                                        FinalArray.push(tempObj);
                                                    }
                                                });
                                            })

                                            res.send({rows: FinalArray});
                                        }
                                    })
                                }catch(e){
                                    console.log(e);
                                }

                            }
                        });
                        jiraRequestArray.push(url);

                    }
                } else {
                    var query = "Select m.module_name,SUM(f.fault_found) as count \
                                from  module as m inner join faults_found f on(m.module_id=f.module_id) \
                                inner join version v on (f.version_id=v.version_id) \
                                where f.version_id =" + versionArray[0].version_id +"  Group by  m.module_id";

                    try{
                        db.all(query, function (err, rows) {
                            if (err) {
                                console.log(err);
                                res.send("Internal Error");
                            } else {
                                var jiraList = [];
                                newModuleArray.map(function (data) {
                                    var urlLink = "https://jira.ericssonudn.net/issues/?jql=project in (" + data + ") AND " + versionString + "AND issuetype in (BUG, Problem)";
                                    var jiraObj = {
                                        name: data,
                                        count: 0,
                                        bug: 0,
                                        bugAfter: 0,
                                        jiraList: urlLink
                                    };
                                    jiraList.push(jiraObj);
                                });
                                if (jiraData.issues) {
                                    jiraData.issues.map(function (data) {
                                        var vname = data.fields.project.key;
                                        // var slicedname = vname.substring(0,vname.length-2);
                                        jiraList.map(function (moduleData, index) {
                                            if (moduleData.name.toUpperCase() == vname.toUpperCase()) {
                                                jiraList[index].count = moduleData.count + 1;
                                                if (data.fields.issuetype.name.toUpperCase() == 'BUG' || data.fields.issuetype.name.toUpperCase() == 'PROBLEM') {
                                                    jiraList[index].bug = moduleData.bug + 1;
                                                }
                                                /*else{
                                                                                            jiraList[index].dev =moduleData.dev +1;
                                                                                        }*/
                                            }
                                        });
                                    });
                                }

                                var FinalArray = [];
                                jiraList.map(function (jiraData) {
                                    rows.map(function (dbData) {
                                        if (dbData.module_name.toUpperCase() == jiraData.name.toUpperCase()) {
                                            var y = jiraData.count;
                                            var x = dbData.count;
                                            var fst = ((x) / (x + y)) * 100;
                                            var tempObj = {
                                                name: dbData.module_name,
                                                quality: fst,
                                                bug: jiraData.bug,
                                                bugAfter: dbData.count,
                                                jiraLink: jiraData.jiraList
                                            }
                                            FinalArray.push(tempObj);
                                        }
                                    });
                                })

                                res.send({rows: FinalArray});
                            }
                        })
                    }catch(e){
                        console.log(e);
                    }

                }
            });
        }
    });


    function getDistributedQuality(version, moduleArray, callback) {

        var username = "rdaggolu";
        var password = "ramesh1976";
        var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
        var request = require('request');
        var tempArray = [];
        var Prod = [];
        var notProd = [];

        moduleArray.map(function (data) {

            var url = 'https://jira.ericssonudn.net/rest/api/2/search?jql= project in ("' + data + '") AND (fixVersion =' + version + ' OR fixVersion=' + version + '.0) AND ( "Bug Origin Environment" = Production )';
            //console.log(url)
            request.get({
                url: url,
                headers: {
                    "Authorization": auth
                }
            }, function (error, response, body) {
                var jiraData = JSON.parse(body);
                var proObj = {
                    count: jiraData.total,
                    module: data
                };
                var url1 = 'https://jira.ericssonudn.net/rest/api/2/search?jql= project in ("' + data + '") AND (fixVersion =' + version + ' OR fixVersion=' + version + '.0) AND ( "Bug Origin Environment" != Production )';
                //console.log(url1);
                request.get({
                    url: url1,
                    headers: {
                        "Authorization": auth
                    }
                }, function (error1, response1, body1) {
                    var jiraData1 = JSON.parse(body1);
                    //console.log(jiraData1.total);
                    var notProObj = {
                        count: jiraData1.total,
                        module: data
                    };
                    Prod.push(proObj);
                    notProd.push(notProObj);
                    if (Prod.length == moduleArray.length && notProd.length == moduleArray.length) {
                        var list = []

                        Prod.map(function (data, index) {
                            var y = data.count;
                            var x = notProd[index].count;
                            var fst = (y / (x + y)) * 10;
                            var tempObj = {
                                name: data.module,
                                quality: fst,
                                bug: x,
                                bugAfter: y,
                                jiraLink: 'https://jira.ericssonudn.net/issues/?jql=project in ("' + data.module + '")  AND (fixVersion =' + version + ' OR fixVersion=' + version + '.0) AND ( "Bug Origin Environment" = Production )',
                                jiraLink: 'https://jira.ericssonudn.net/issues/?jql=project in ("' + data.module + '") AND (fixVersion =' + version + ' OR fixVersion=' + version + '.0) AND ( "Bug Origin Environment" != Production )'
                            }
                            list.push(tempObj)
                        });
                        callback(list);
                    }
                });

            });

        });
    }


    app.get("/getDevStatusForRelease", function (req, res) {
        var versionArray = req.query['versionArray'];
        var moduleArray = req.query['moduleArray'];
        versionArray = JSON.parse(versionArray);
        moduleArray = JSON.parse(moduleArray);
        var newVersionArray = [];
        var newModuleArray = [];
        var versionString = "(";
        versionArray.map(function (data) {
            if (data.name.toUpperCase() != "SUMMARY") {
                newVersionArray.push(data.name);
                var release = data.name.split(" ");
                if (release[1] != "2.3" && release[1] < "2.5") {
                    versionString += "fixVersion =" + release[1] + ".0 OR fixVersion=" + release[1] + " OR ";
                }else{
                    versionString += "fixVersion =" + release[1] + ".0 OR ";
                }
            }
        });

        versionString = versionString.substring(0, versionString.length - 3);

        versionString += ")";


        // console.log(JSON.stringify(moduleArray));

        var moduleString = "(";

        moduleArray.map(function (data) {
            newModuleArray.push(data);
            moduleString += '"' + data + '",';
        });

        moduleString = moduleString.substring(0, moduleString.length - 1);
        moduleString += ")";

        // console.log(moduleArray);

        var username = "rdaggolu";
        var password = "ramesh1976";
        var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
        var request = require('request');
        // var url = "https://vidscale.atlassian.net/rest/gadget/1.0/statistics?filterId=21204&statType=statuses&_=1500335680701";
        var url = "https://jira.ericssonudn.net/rest/api/2/search?jql=project in " + moduleString + " AND " + versionString + "AND issuetype in (BUG, Problem,Sub-task, task, 'technical task','Doc Task') AND status in ('REOPENED','TO DO','IN PROGRESS','IN TRIAGE','In Review','Scheduled','DONE','READY FOR TEST','IN TEST')&fields=project,status,issuetype&maxResults=1000"
        // url =url + pageStr

        // console.log("url="+url);

        var strText = "";
        // console.log(url)
        request.get({
            url: url,
            headers: {
                "Authorization": auth
            }
        }, function (error, response, body) {

            var query = "Select * from status_types";
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    var jiraList = [];
                    newModuleArray.map(function (data) {
                        rows.map(function (statusData) {
                            var jiraObj = {
                                module_name: data,
                                status_name: statusData.status_name,
                                count: 0,
                                bug: 0,
                                dev: 0,
                                BugLink: "https://jira.ericssonudn.net/issues/?jql=project in (" + data + ") AND " + versionString + "AND issuetype in (BUG, Problem) AND status = '" + statusData.status_name + "'",
                                devLink: "https://jira.ericssonudn.net/issues/?jql=project in (" + data + ") AND " + versionString + "AND issuetype in (Sub-task, task, 'technical task') AND status = '" + statusData.status_name + "'"
                            };
                            jiraList.push(jiraObj);
                        });


                    });
                    // console.log("jiraList"+JSON.stringify(jiraList));
                    var jiraData = JSON.parse(body);
                    if (jiraData.issues) {
                        jiraData.issues.map(function (data) {
                            var vname = data.fields.project.key;
                            var sname = data.fields.status.name;
                            var issuetype = data.fields.issuetype.name;
                            // var slicedname = vname.substring(0,vname.length-2);
                            jiraList.map(function (moduleData, index) {
                                if (moduleData.module_name.toUpperCase() == vname.toUpperCase() && moduleData.status_name.toUpperCase() == sname.toUpperCase()) {
                                    jiraList[index].count++;
                                    if (issuetype.toUpperCase() == "BUG" || issuetype.toUpperCase() == "PROBLEM") {
                                        jiraList[index].bug++;
                                    }else{
                                        jiraList[index].dev++;
                                    }

                                   /* if (issuetype.toUpperCase() == "SUB-TASK" || issuetype.toUpperCase() == "TASK" || issuetype.toUpperCase() == "TEST TASK" || issuetype.toUpperCase() == 'Doc Task' ||issuetype.toUpperCase() == "TECHNICAL TASK'") {
                                        jiraList[index].dev++;
                                    }*/
                                }


                            });
                        });
                    }

                    // console.log("jiraList1"+JSON.stringify(jiraList));
                    // console.log("jiraList2"+JSON.stringify(rows));


                    var FinalArray = [];
                    /*jiraList.map(function(jiraData){
                        rows.map(function(dbData){
                            if(dbData.module_name.toUpperCase() == jiraData.name.toUpperCase()){
                                var y = jiraData.count;
                                var x= dbData.count;
                                var fst = (y/(x+y))*100;
                                var tempObj = {
                                    name: dbData.module_name,
                                    quality: fst
                                }
                                FinalArray.push(tempObj);
                            }
                        });
                    })*/


                    res.send({rows: jiraList});
                }
            })
        });
    })

    app.get("/getDevTestStatusForRelease", function (req, res) {
        var versionArray = req.query['versionArray'];
        var moduleArray = req.query['moduleArray'];
        versionArray = JSON.parse(versionArray);
        moduleArray = JSON.parse(moduleArray);
        var newVersionArray = [];
        var newModuleArray = [];
        var versionString = "(";
        versionArray.map(function (data) {
            if (data.name.toUpperCase() != "SUMMARY") {
                newVersionArray.push(data.name);
                var release = data.name.split(" ");
                if (release[1] != "2.3" && release[1] < "2.5") {
                    versionString += "fixVersion =" + release[1] + ".0 OR fixVersion=" + release[1] + " OR ";
                } else {
                    versionString += "fixVersion =" + release[1] + ".0 OR ";
                }
            }
        });

        versionString = versionString.substring(0, versionString.length - 3);

        versionString += ")";


        // console.log(JSON.stringify(moduleArray));

        var moduleString = "(";

        moduleArray.map(function (data) {
            newModuleArray.push(data);
            moduleString += '"' + data + '",';
        });

        moduleString = moduleString.substring(0, moduleString.length - 1);
        moduleString += ")";

        // console.log(moduleArray);

        var username = "rdaggolu";
        var password = "ramesh1976";
        var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
        var request = require('request');
        // var url = "https://vidscale.atlassian.net/rest/gadget/1.0/statistics?filterId=21204&statType=statuses&_=1500335680701";
        var url = "https://jira.ericssonudn.net/rest/api/2/search?jql=project in " + moduleString + " AND " + versionString + "AND issuetype in (BUG, Problem,Sub-task, task, 'technical task','Test Task','Doc Task') AND status in ('REOPENED','TO DO','IN PROGRESS','IN TRIAGE','In Review','Scheduled','DONE','READY FOR TEST','IN TEST')&fields=project,status,issuetype&maxResults=1000"
        // url =url + pageStr

        // console.log("url="+url);

        var strText = "";
         //console.log(url)
        request.get({
            url: url,
            headers: {
                "Authorization": auth
            }
        }, function (error, response, body) {

            var query = "Select * from status_types";
            try{
                db.all(query, function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.send("Internal Error");
                    } else {
                        var jiraList = [];
                        newModuleArray.map(function (data) {
                            rows.map(function (statusData) {
                                var jiraObj = {
                                    module_name: data,
                                    status_name: statusData.status_name,
                                    count: 0,
                                    bug: 0,
                                    dev: 0,
                                    BugLink: "https://jira.ericssonudn.net/issues/?jql=project in (" + data + ") AND " + versionString + "AND issuetype in (BUG, Problem) AND status = '" + statusData.status_name + "'",
                                    devLink: "https://jira.ericssonudn.net/issues/?jql=project in (" + data + ") AND " + versionString + "AND issuetype in (Sub-task, task, 'technical task') AND status = '" + statusData.status_name + "'"
                                };
                                jiraList.push(jiraObj);
                            });


                        });
                        console.log("jiraList"+JSON.stringify(newModuleArray));
                        console.log("rows"+JSON.stringify(rows));
                        var jiraData = JSON.parse(body);
                        if (jiraData.issues) {
                            var count=0;
                            jiraData.issues.map(function (data) {
                                var vname = data.fields.project.key;
                                var sname = data.fields.status.name;
                                var issuetype = data.fields.issuetype.name;
                                // var slicedname = vname.substring(0,vname.length-2);
                                jiraList.map(function (moduleData, index) {

                                    if (moduleData.module_name.toUpperCase() == vname.toUpperCase() && moduleData.status_name.toUpperCase() == sname.toUpperCase()) {
                                        jiraList[index].count++;
                                        if (issuetype.toUpperCase() == "BUG" || issuetype.toUpperCase() == "PROBLEM") {
                                            jiraList[index].bug++;
                                        }else{
                                            //console.log("issutype",issuetype);
                                            jiraList[index].dev++;
                                        }
                                        /*if (issuetype.toUpperCase() == "SUB-TASK" || issuetype.toUpperCase() == "TASK" || issuetype.toUpperCase() =='Test Task'||issuetype.toUpperCase() == 'Doc Task' || issuetype.toUpperCase() == "TECHNICAL TASK'") {
                                            jiraList[index].dev++;
                                        }*/
                                    }


                                });
                                count++
                            });
                            //console.log("count",count);
                        }

                        // console.log("jiraList1"+JSON.stringify(jiraList));
                        // console.log("jiraList2"+JSON.stringify(rows));


                        var FinalArray = [];
                        /*jiraList.map(function(jiraData){
                            rows.map(function(dbData){
                                if(dbData.module_name.toUpperCase() == jiraData.name.toUpperCase()){
                                    var y = jiraData.count;
                                    var x= dbData.count;
                                    var fst = (y/(x+y))*100;
                                    var tempObj = {
                                        name: dbData.module_name,
                                        quality: fst
                                    }
                                    FinalArray.push(tempObj);
                                }
                            });
                        })*/


                        res.send({rows: jiraList});
                    }
                })
            }catch(e){
                console.log(e);
            }



        });
    })

    app.get('/getReleaseQualityScope', function (req, res) {
        var query = "select v.version_id, v.name, v.number, qs.qualityStatus_name, rq.releaseQuality_id, rq.qualityStatus_id, rq.quality_comment, rq.scope_id, rq.scope_comment " +
                    "from release_quality rq, version v, quality_status qs, quality_status ss " +
                    "where rq.version_id = v.version_id ";

        //console.log('querygetQualityChartForSummery----',query);
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });


    app.get('/releaseDashboardByYear', function (req, res) {

        var year=req.query['year'];
        var releaseDashboard_procedureSQL =  "CALL releaseDashboard_procedure(?)";
        db.run(releaseDashboard_procedureSQL,[year], function (err, rows) {
            if(err){
                res.status(400).send(err)
            }
            else{
                res.status(200).send(rows[0]);
            }

        })

    });

    app.get('/getQualityChartForSummery', function (req, res) {
        var year= req.query['year'];
        var query = "Select v.version_id,v.name,v.number,q.qualityStatus_name,r.releaseQuality_id,r.qualityStatus_id, r.time_id, r.scope_id ,r.quality_comment from version as v \
                    left outer join release_quality as r on (v.version_id = r.version_id) \
                    left outer join quality_status as q on   (r.qualityStatus_id = q.qualityStatus_id) \
                    left outer join release_timeschedule as a on (v.version_id = a.version_id)\
                    where v.version_id != 5 and v.version_id != 0 and a.start_time like '"+year+"%' or a.end_time like '"+year+"%' or a.actual_end_time like '"+year+"%' group by v.version_id order by v.number";

        //console.log('querygetQualityChartForSummery----',query);
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({rows: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });

    app.post('/updateReleaseQuality', function (req, res) {
        var body = req.body;
        var bodyString = JSON.stringify(body);
        var editReleaseQuality_procedureSQL =  "CALL editReleaseQuality_procedure(?)";
        db.run(editReleaseQuality_procedureSQL,[bodyString], function (err, rows) {
            if(err){
                res.status(200).send(err)
            }
            else{
                res.sendStatus(200);
            }

        })

    });



    app.post('/updateCPBillable', function (req, res) {
        var body1 = req.body;
        var query = '';
        var cpAccountName = body1.cpAccountName == "" ? null : body1.cpAccountName;
        if ((cpAccountName != "" ) || (cpAccountName != null )) {
            var billableDate = body1.billableDate == "" ? null : body1.billableDate;
            query = "update cp_account set cp_billableDate=" + billableDate +
                " WHERE cp_account_name = '" + cpAccountName +"'";

        }
        if (query != '') {
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send('success');
                }
            })
        }

    });
    app.get('/getCPtraffic', function (req, res) {
        var dateFrom = req.query["dateFrom"];
        var dateTo = req.query["dateTo"];
        var query = "select details_sp_group,details_percent_total,details_bytes,details_property,details_name,details_sp_account,details_asset,details_account,details_group,details_detail_percent_of_entity,details_detail_bytes,details_detail_percent_of_timestamp,details_detail_bits_per_second,details_detail_timestamp,cp_account_billable_date,china_data from traffic_cp_contribution where details_detail_timestamp between " + dateFrom + " and " + dateTo;
        //console.log('query', query);
        try{
            db.all(query, function (err, rows) {
            if (err) {
                console.log(err);
                res.send("Internal Error");
            } else {
                res.send({data: rows});
            }
        })
        }catch(e){
            console.log(e);
        }

    });

    app.get('/getCPAccounts', function (req, res) {
        var query = "select cp_account_id,cp_account_name,cp_billableDate from cp_account";
        try{
            db.all(query, function (err, rows) {
            if (err) {
                console.log(err);
                res.send("Internal Error");
            } else {
                res.send({data: rows});
            }
        })
        }catch(e){
            console.log(e);
        }

    });

    /* Table API Start */
    app.get('/getAllTableCPAccountsList', function (req, res) {
        let dateFrom = req.query["dateFrom"];
        let dateTo = req.query["dateTo"];
        let query = "select cp.cp_account_id, cp.cp_account_name,dis.details_sp_account, sum(dis.details_detail_bytes) as total_bytes " +
            " from traffic_cp_contribution dis, cp_account cp " +
            " where dis.details_account = cp.cp_account_id " +
            " AND dis.details_sp_account NOT IN (40073, 40074, 40075) " +
            " and (dis.details_detail_timestamp between  " + dateFrom + " and " + dateTo + ") " +
            " group by dis.details_account";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({data: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });
    /*Billable Date used */
    app.get('/getAllTableCPAccountsListWithBillableData', function (req, res) {
        let dateFrom = req.query["dateFrom"];
        let dateTo = req.query["dateTo"];
        let query = "select cp.cp_account_id, cp.cp_account_name, sum(dis.details_detail_bytes) as total_bytes,dis.details_sp_account,cp.cp_billableDate from traffic_cp_contribution dis, cp_account cp where dis.details_account = cp.cp_account_id AND dis.details_sp_account NOT IN (40073, 40074, 40075) and dis.details_detail_timestamp >= cp.cp_billableDate and (dis.details_detail_timestamp between  " + dateFrom + " and " + dateTo + ") group by dis.details_account";
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({data: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });
    /* China Data Integration without billable date used */
    app.get('/getTotalTableChinaDataTable', function (req, res) {
        var dateFrom = req.query["dateFrom"];
        var dateTo = req.query["dateTo"];

        var query = "select cpa.cp_account_id, cpa.cp_account_name, sum(cpt.traffic_total) as traffic_total " +
            " from cp_china_traffic cpt, cp_account cpa " +
            " where cpa.cp_account_name like CONCAT('%', cpt.chinaCpName, '%') " +
            " and cpt.timeStamp >= "+ dateFrom + " and cpt.timeStamp <= " + dateTo + " " +
            " and cpt.chinaSpName NOT IN ('UDN') " +
            " group by cpa.cp_account_name " +
            " order by cpa.cp_account_name";


        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({data: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });
    app.get('/getTotalTableChinaDataTableBillable', function (req, res) {
        var dateFrom = req.query["dateFrom"];
        var dateTo = req.query["dateTo"];
        var query = "select cpa.cp_account_id, cpa.cp_account_name,  sum(cpt.traffic_total) as billable_traffic_total " +
            " from cp_china_traffic cpt, cp_account cpa " +
            " where cpa.cp_account_name like CONCAT('%', cpt.chinaCpName, '%') " +
            " and  cpt.timestamp >= CAST(FROM_UNIXTIME(cpa.cp_billableDate, '%Y%m%d00') AS UNSIGNED) " +
            " and cpt.timeStamp >= "+ dateFrom +" and cpt.timeStamp <= "+ dateTo +
            " and cpt.chinaSpName NOT IN ('UDN')" +
            " group by cpa.cp_account_name";


        // var query = "select cpa.cp_account_id, cpa.cp_account_name,  sum(cpt.traffic_total) as billable_traffic_total from cp_china_traffic cpt, cp_account cpa where cpa.cp_account_name like CAST(FROM_UNIXTIME(cpa.cp_billableDate, '%Y%m%d00') AS UNSIGNED) and  cpt.timestamp >= UNIX_TIMESTAMP(cpa.cp_billableDate) and cpt.timeStamp >= "+ dateFrom +" and cpt.timeStamp <= "+ dateTo +" group by cpa.cp_account_name";

        //console.log("China Billable Data");
        //console.log(query);
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({data: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });
    /* Table API End */

    /* Graph API Start */
    app.get('/getAllCPAccountsList', function (req, res) {
        let dateFrom = req.query["dateFrom"];
        let dateTo = req.query["dateTo"];
        let query = "select cp.cp_account_id, cp.cp_account_name,dis.details_sp_account, sum(dis.details_detail_bytes) as total_bytes " +
        " from traffic_cp_contribution dis, cp_account cp " +
        " where dis.details_account = cp.cp_account_id " +
        " AND dis.details_sp_account NOT IN (40073, 40074, 40075) " +
        " and (dis.details_detail_timestamp between  " + dateFrom + " and " + dateTo + ") " +
        " group by dis.details_sp_account";
        try{
            db.all(query, function (err, rows) {
            if (err) {
                console.log(err);
                res.send("Internal Error");
            } else {
                res.send({data: rows});
            }
        })
        }catch(e){
            console.log(e);
        }

    });
    /*Billable Date used */
    app.get('/getAllCPAccountsListWithBillableData', function (req, res) {
        let dateFrom = req.query["dateFrom"];
        let dateTo = req.query["dateTo"];
        let query = "select cp.cp_account_id, cp.cp_account_name, sum(dis.details_detail_bytes) as total_bytes,dis.details_sp_account,cp.cp_billableDate from traffic_cp_contribution dis, cp_account cp where dis.details_account = cp.cp_account_id AND dis.details_sp_account NOT IN (40073, 40074, 40075) and dis.details_detail_timestamp >= cp.cp_billableDate and (dis.details_detail_timestamp between  " + dateFrom + " and " + dateTo + ") group by dis.details_sp_account";
        try{
            db.all(query, function (err, rows) {
            if (err) {
                console.log(err);
                res.send("Internal Error");
            } else {
                res.send({data: rows});
            }
        })
        }catch(e){
            console.log(e);
        }

    });
    /* China Data Integration without billable date used */
    app.get('/getTotalChinaDataTable', function (req, res) {
        var dateFrom = req.query["dateFrom"];
        var dateTo = req.query["dateTo"];

        var query = "select cpa.cp_account_id, cpa.cp_account_name, sum(cpt.traffic_total) as traffic_total " +
            " from cp_china_traffic cpt, cp_account cpa " +
            " where cpa.cp_account_name like CONCAT('%', cpt.chinaCpName, '%') " +
            " and cpt.timeStamp >= "+ dateFrom + " and cpt.timeStamp <= " + dateTo + " " +
            " and cpt.chinaSpName NOT IN ('UDN') " +
            " group by cpa.cp_account_name " +
            " order by cpa.cp_account_name";


        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({data: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });
    app.get('/getTotalChinaDataTableBillable', function (req, res) {
        var dateFrom = req.query["dateFrom"];
        var dateTo = req.query["dateTo"];
        var query = "select cpa.cp_account_id, cpa.cp_account_name,  sum(cpt.traffic_total) as billable_traffic_total " +
            " from cp_china_traffic cpt, cp_account cpa " +
            " where cpa.cp_account_name like CONCAT('%', cpt.chinaCpName, '%') " +
            " and  cpt.timestamp >= CAST(FROM_UNIXTIME(cpa.cp_billableDate, '%Y%m%d00') AS UNSIGNED) " +
            " and cpt.timeStamp >= "+ dateFrom +" and cpt.timeStamp <= "+ dateTo +
            " and cpt.chinaSpName NOT IN ('UDN')" +
            " group by cpa.cp_account_name";


        // var query = "select cpa.cp_account_id, cpa.cp_account_name,  sum(cpt.traffic_total) as billable_traffic_total from cp_china_traffic cpt, cp_account cpa where cpa.cp_account_name like CAST(FROM_UNIXTIME(cpa.cp_billableDate, '%Y%m%d00') AS UNSIGNED) and  cpt.timestamp >= UNIX_TIMESTAMP(cpa.cp_billableDate) and cpt.timeStamp >= "+ dateFrom +" and cpt.timeStamp <= "+ dateTo +" group by cpa.cp_account_name";

        //console.log("China Billable Data");
        //console.log(query);
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
                    res.send({data: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });
    /* Graph API End */
    /* To get scheduler date select max(details_detail_timestamp) from  traffic_cp_contribution */
    app.get('/getSchedulerRunDate', function (req, res) {
        let dateFrom = req.query["dateFrom"];
        let dateTo = req.query["dateTo"];
        let query = "select max(details_detail_timestamp) as scheduler_run from  traffic_cp_contribution";
        //console.log("query");
        //console.log(query);
        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {

                    res.send({data: rows});
                }
            })
        }catch(e){
            console.log(e);
        }

    });


    app.post('/uploadPdfLink', function (req, res) {
        let upload_url = req.body["upload_url"];
        let query = "INSERT INTO upload_process_link (file_url) VALUES  ('" + upload_url + "')";
        try{
            db.all(query, function (err) {
            if (err) {
                res.send(err);
            } else {
                res.send("Added");
            }
        });
        }catch(e){
            console.log(e);
        }

    });

    app.get('/getAllUploadLinks', function (req, res) {
        let query = "select file_url from upload_process_link";
        try{
           db.all(query, function (err,rows) {
            if (err) {
                res.send(err);
            } else {
                res.send({data: rows});
            }
        });
        }catch(e){
            console.log(e);
        }


    });


    app.get('/getSPAccounts', function (req, res) {
        var query = "select sp_account_id,sp_account_name from sp_account";
        try{
            db.all(query, function (err, rows) {
            if (err) {
                console.log(err);
                res.send("Internal Error");
            } else {
                res.send({data: rows});
            }
        })
        }catch(e){
            console.log(e);
        }

    });



}

