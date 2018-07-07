/**
 * Created by jeetkapadia on 4/10/17.
 */

var http = require('http');
var https = require('https');
var querystring = require('querystring');

exports.init = function(app,db) {

    app.get('/get_development_KPI', function (req, res) {

        var year = req.query["year"];
        try{
            db.all("SELECT development_KPI_id, d.kpi_id, achieved, remaining, goal, year, quater, k.kpi_state FROM development_KPI d \
                    INNER JOIN kpi_states k ON (k.kpi_id=d.kpi_id) \
                    WHERE year=" + year + " AND k.kpi_id <> 5 AND d.kpi_id <> 5" , function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.send("Internal Error");
                    } else {
                        res.send(rows)
                    }
            });
        }catch(e){
            console.log(e);
        }
            
    });

    app.get('/get_development_KPI_years',function(req, res){
        try{
            db.all("select distinct(year) from development_KPI", function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.send("Internal Error");
                    } else {
                        res.send(rows)
                    }
            });
        }catch(e){
            console.log(e);
        }
            
    })

    app.get('/get_kpiState',function(req,res){
        try{
            // Not fetching the kpi_id 5 as its should not be editable, and is auto generated entity
            db.all("SELECT ks.kpi_state FROM kpi_states ks WHERE ks.kpi_id <> 5", function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.send("Internal Error");
                    } else {
                        res.send(rows)
                    }
            });
        }catch(e){
            console.log(e);
        }
            
    });

    app.post('/updateDevelopmentKPI',function(req,res){
        var body1 = req.body;
        var arrayQuery=[];
        body1.body.map(function(data,index){
            var development_KPI_id = data.development_KPI_id == "" ? null : data.development_KPI_id;
            var goal = Number(data.achieved)+Number(data.remaining);
            var query = "REPLACE INTO development_KPI (development_KPI_id,kpi_id,achieved,remaining,goal,year,quater)\
                        SELECT "+development_KPI_id+",k.kpi_id,'"+data.achieved+"','"+data.remaining+"','"+goal+"','"+data.year+"','"+data.quater+"' \
                        FROM kpi_states k \
                        WHERE k.kpi_state = '"+data.kpi_state+"'";

            arrayQuery.push(query)
        });
        var query = '';
        if(arrayQuery.length>0) {
            query = arrayQuery[0];
            processAtDatabase(db,arrayQuery,query,res);
        }

    });


    /**
     * Get all the software release achievement by year and indicate its quater
     */
    app.get('/getSoftwareReleaseCount', function (req, res) {
        var year = req.query["year"];
        var query =

            //=== Q1 counts ===
            "SELECT count(*) as count, \"achieved_q1\" AS status " +
            "FROM release_timeschedule " +
            "WHERE DATEDIFF(actual_end_time,end_time) < 4 " +
            "AND phase_id = 6 " +
            "AND actual_end_time IS NOT NULL " +
            "AND actual_end_time <> \"\" " +
            "AND YEAR(STR_TO_DATE(start_time, \"%Y-%m-%d\")) = '" + year + "'" +
            "AND MONTH(STR_TO_DATE(start_time, \"%Y-%m-%d\")) BETWEEN 1 and 3 " +

            "UNION ALL " +

            "SELECT count(*) as count, \"remaining_q1\" AS status " +
            "FROM release_timeschedule " +
            "WHERE IF(actual_end_time, DATEDIFF(actual_end_time,end_time), 1000) >= 4 " +
            "AND phase_id = 6 " +
            "AND YEAR(STR_TO_DATE(start_time, \"%Y-%m-%d\")) = '" + year + "'" +
            "AND MONTH(STR_TO_DATE(start_time, \"%Y-%m-%d\")) BETWEEN 1 and 3 " +

            "UNION ALL " +

            "SELECT count(*) as count, \"goal_q1\" AS status " +
            "FROM release_timeschedule " +
            "WHERE phase_id = 6 " +
            "AND YEAR(STR_TO_DATE(start_time, \"%Y-%m-%d\")) = '" + year + "'" +
            "AND MONTH(STR_TO_DATE(start_time, \"%Y-%m-%d\")) BETWEEN 1 and 3 " +


            //=== Q2 counts ===

            "UNION ALL " +

            "SELECT count(*) as count, \"achieved_q2\" AS status " +
            "FROM release_timeschedule " +
            "WHERE DATEDIFF(actual_end_time,end_time) < 4 " +
            "AND phase_id = 6 " +
            "AND actual_end_time IS NOT NULL " +
            "AND actual_end_time <> \"\" " +
            "AND YEAR(STR_TO_DATE(start_time, \"%Y-%m-%d\")) = '" + year + "'" +
            "AND MONTH(STR_TO_DATE(start_time, \"%Y-%m-%d\")) BETWEEN 4 and 6 " +

            "UNION ALL " +

            "SELECT count(*) as count, \"remaining_q2\" AS status " +
            "FROM release_timeschedule " +
            "WHERE IF(actual_end_time, DATEDIFF(actual_end_time,end_time), 1000) >= 4 " +
            "AND phase_id = 6 " +
            "AND YEAR(STR_TO_DATE(start_time, \"%Y-%m-%d\")) = '" + year + "'" +
            "AND MONTH(STR_TO_DATE(start_time, \"%Y-%m-%d\")) BETWEEN 4 and 6 " +

            "UNION ALL " +

            "SELECT count(*) as count, \"goal_q2\" AS status " +
            "FROM release_timeschedule " +
            "WHERE phase_id = 6 " +
            "AND YEAR(STR_TO_DATE(start_time, \"%Y-%m-%d\")) = '" + year + "'" +
            "AND MONTH(STR_TO_DATE(start_time, \"%Y-%m-%d\")) BETWEEN 4 and 6 " +

            //=== Q3 counts ===

            "UNION ALL " +

            "SELECT count(*) as count, \"achieved_q3\" AS status " +
            "FROM release_timeschedule " +
            "WHERE DATEDIFF(actual_end_time,end_time) < 4 " +
            "AND phase_id = 6 " +
            "AND actual_end_time IS NOT NULL " +
            "AND actual_end_time <> \"\" " +
            "AND YEAR(STR_TO_DATE(start_time, \"%Y-%m-%d\")) = '" + year + "'" +
            "AND MONTH(STR_TO_DATE(start_time, \"%Y-%m-%d\")) BETWEEN 7 and 9 " +

            "UNION ALL " +

            "SELECT count(*) as count, \"remaining_q3\" AS status " +
            "FROM release_timeschedule " +
            "WHERE IF(actual_end_time, DATEDIFF(actual_end_time,end_time), 1000) >= 4 " +
            "AND phase_id = 6 " +
            "AND YEAR(STR_TO_DATE(start_time, \"%Y-%m-%d\")) = '" + year + "'" +
            "AND MONTH(STR_TO_DATE(start_time, \"%Y-%m-%d\")) BETWEEN 7 and 9 " +

            "UNION ALL " +

            "SELECT count(*) as count, \"goal_q3\" AS status " +
            "FROM release_timeschedule " +
            "WHERE phase_id = 6 " +
            "AND YEAR(STR_TO_DATE(start_time, \"%Y-%m-%d\")) = '" + year + "'" +
            "AND MONTH(STR_TO_DATE(start_time, \"%Y-%m-%d\")) BETWEEN 7 and 9 " +

            //=== Q4 counts ===

            "UNION ALL " +

            "SELECT count(*) as count, \"achieved_q4\" AS status " +
            "FROM release_timeschedule " +
            "WHERE DATEDIFF(actual_end_time,end_time) < 4 " +
            "AND phase_id = 6 " +
            "AND actual_end_time IS NOT NULL " +
            "AND actual_end_time <> \"\" " +
            "AND YEAR(STR_TO_DATE(start_time, \"%Y-%m-%d\")) = '" + year + "'" +
            "AND MONTH(STR_TO_DATE(start_time, \"%Y-%m-%d\")) BETWEEN 10 and 12 " +

            "UNION ALL " +

            "SELECT count(*) as count, \"remaining_q4\" AS status " +
            "FROM release_timeschedule " +
            "WHERE IF(actual_end_time, DATEDIFF(actual_end_time,end_time), 1000) >= 4 " +
            "AND phase_id = 6 " +
            "AND YEAR(STR_TO_DATE(start_time, \"%Y-%m-%d\")) = '" + year + "'" +
            "AND MONTH(STR_TO_DATE(start_time, \"%Y-%m-%d\")) BETWEEN 10 and 12 " +

            "UNION ALL " +

            "SELECT count(*) as count, \"goal_q4\" AS status " +
            "FROM release_timeschedule " +
            "WHERE phase_id = 6 " +
            "AND YEAR(STR_TO_DATE(start_time, \"%Y-%m-%d\")) = '" + year + "'" +
            "AND MONTH(STR_TO_DATE(start_time, \"%Y-%m-%d\")) BETWEEN 10 and 12";



        try{
            db.all(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send("Internal Error");
                } else {
    
                    sw_results = [];
                    let sw_result_q1 = {};
                    let sw_result_q2 = {};
                    let sw_result_q3 = {};
                    let sw_result_q4 = {};
    
                    rows.map(function(row) {
    
                        let status_and_quater = row['status'].split("_");
                        let status = status_and_quater[0];
                        let quater = status_and_quater[1];
    
    
                        //iteratively fill all the Q1 fields
                        if (quater == 'q1') {
                            sw_result_q1['development_KPI_id'] = 10000; //this attribute must be assigned to comply with
                            sw_result_q1['kpi_id'] = 5;
                            sw_result_q1['year'] = year;
                            sw_result_q1['kpi_state'] = 'SW RELEASE ON TIME';
                            sw_result_q1['quater'] = 'Q1';
                            sw_result_q1[status] = row['count'];
                        }
                        //iteratively fill all the Q2 fields
                        else if  (quater == 'q2') {
                            sw_result_q2['development_KPI_id'] = 10000; //this attribute must be assigned to comply with
                            sw_result_q2['kpi_id'] = 5;
                            sw_result_q2['year'] = year;
                            sw_result_q2['kpi_state'] = 'SW RELEASE ON TIME';
                            sw_result_q2['quater'] = 'Q2';
                            sw_result_q2[status] = row['count'];
                        }
                        //iteratively fill all the Q3 fields
                        else if  (quater == 'q3') {
                            sw_result_q3['development_KPI_id'] = 10000; //this attribute must be assigned to comply with
                            sw_result_q3['kpi_id'] = 5;
                            sw_result_q3['year'] = year;
                            sw_result_q3['kpi_state'] = 'SW RELEASE ON TIME';
                            sw_result_q3['quater'] = 'Q3';
                            sw_result_q3[status] = row['count'];
                        }
                        //iteratively fill all the Q4 fields
                        else if  (quater == 'q4') {
                            sw_result_q4['development_KPI_id'] = 10000; //this attribute must be assigned to comply with
                            sw_result_q4['kpi_id'] = 5;
                            sw_result_q4['year'] = year;
                            sw_result_q4['kpi_state'] = 'SW RELEASE ON TIME';
                            sw_result_q4['quater'] = 'Q4';
                            sw_result_q4[status] = row['count'];
                        }
    
                    });
    
                    if (sw_result_q1 != {}) {
    
                        sw_results.push(sw_result_q1);
                    }
    
                    if (sw_result_q2 != {}) {
    
                        sw_results.push(sw_result_q2);
                    }
    
                    if (sw_result_q3 != {}) {
    
                        sw_results.push(sw_result_q3);
                    }
    
                    if (sw_result_q4 != {}) {
    
                        sw_results.push(sw_result_q4);
                    }
    
    
                    res.send(sw_results);
                }
            })     
        }catch(e){
                console.log(e);
        }
        

    });

    function processAtDatabase(db,arrayQuery,query,res) {
        try{
            db.run(query,function(err, rows){
                arrayQuery.shift();
                if(arrayQuery.length>0){
                    query = arrayQuery[0];
                    processAtDatabase(db,arrayQuery,query,res);
                }
                else{
                    res.send("success");
                }

                if(err){
                    console.log(err);
                }else{
                    //res.send("success");
                }
            });
        }catch(e){
            console.log(e);
        }

    }
    
}