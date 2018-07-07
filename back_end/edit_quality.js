
exports.init = function(app,db) {

    app.get('/getCurrentVersion',function(req,res){
               var query = "SELECT v.version_id, v.name,CONCAT(CAST(v.number AS DECIMAL(4,1))) AS number, \n" +
                   "        v.date, v.type, YEAR(STR_TO_DATE(end_time, '%Y-%m-%d')) AS relyear,release_timeschedule.phase_id,release_timeschedule.`start_time`,release_timeschedule.`end_time`,\n" +
                   "        release_timeschedule.actual_end_time\n" +
                   "FROM\n" +
                   "  release_timeschedule\n" +
                   "  JOIN (\n" +
                   "    SELECT version_id, MAX(phase_id)-1 AS phase_id\n" +
                   "    FROM release_timeschedule \n" +
                   "    GROUP BY version_id\n" +
                   "  ) maxphase_id   \n" +
                   "        ON release_timeschedule.version_id = maxphase_id.version_id \n" +
                   "        AND release_timeschedule.phase_id = maxphase_id.phase_id\n" +
                   "\t\tAND        STR_TO_DATE(actual_end_time, '%Y-%m-%d') <= CURRENT_TIMESTAMP()\n" +
                   "        INNER JOIN version v\n" +
                   "        ON v.version_id = release_timeschedule.version_id \n" +
                   "        order by STR_TO_DATE(actual_end_time, '%Y-%m-%d') desc\n" +
                   "        limit 1\n";

        try{
            db.all(query, function (error,response) {
            if(error){
                console.log('Error in release_phase' + error);
                res.send(error);
            }else{
                res.send(response.length>0?response[0]:{});
            }
        })
        }catch(e){
            console.log(e);
        }
        
    });


        app.get('/getCurrentVersionForProduction',function(req,res){


            var query = "SELECT v.version_id, v.name,CONCAT(CAST(v.number AS DECIMAL(4,1))) AS number, \n" +
                    "        v.date, v.type, YEAR(STR_TO_DATE(end_time, '%Y-%m-%d')) AS relyear,release_timeschedule.phase_id,release_timeschedule.`start_time`,release_timeschedule.`end_time`\n" +
                    "FROM\n" +
                    "  release_timeschedule\n" +
                    "  JOIN (\n" +
                    "    SELECT version_id, MAX(phase_id) AS phase_id\n" +
                    "    FROM release_timeschedule \n" +
                    "    GROUP BY version_id\n" +
                    "  ) maxphase_id   \n" +
                    "    \tON release_timeschedule.version_id = maxphase_id.version_id \n" +
                    "        AND release_timeschedule.phase_id = maxphase_id.phase_id\n" +
                    "       \tAND STR_TO_DATE(end_time, '%Y-%m-%d')<=CURRENT_TIMESTAMP()\n" +
                    "        INNER JOIN version v\n" +
                    "        ON v.version_id = release_timeschedule.version_id order by STR_TO_DATE(end_time, '%Y-%m-%d') desc limit  1\n";

            try{
                db.all(query, function (error,response) {
                    if(error){
                        console.log('Error in release_phase' + error);
                        res.send(error);
                    }else{
                        res.send(response.length>0?response[0]:{});
                    }
                })
            }catch(e){
                console.log(e);
            }

        });

    app.get('/getReleaseFaultSlipThrough',function (req,res) {
        var version_id = req.query['version_id'];
        var query = "Select * from faults_found as a \
           inner join version as b on (a.version_id = b.version_id)\
           inner join module as c on (a.module_id = c.module_id)\
           where a.version_id="+version_id;

        try{
            db.all(query, function (error,response) {
            if(error){
                console.log('Error in release_phase' + error);
                res.send(error);
            }else{
                res.send(response);
            }
        })
        }catch(e){
            console.log(e);
        }
        


    });

    app.get('/deleteFaultFoundForRelease',function (req,res) {
        var fault_id = req.query['fault_id'];
        var deleteQuery = 'Delete from faults_found where fault_id ='+fault_id;
        //console.log(deleteQuery);
        try{
            db.run(deleteQuery,function (err) {
            if(err){
                res.send(err);
            }else{
                res.send("success");
            }
        });
        }catch(e){
            console.log(e);
        }
        
    });

    app.post('/updateFaultFoundForRelease',function(req,res){
        var body1 = req.body;
        console.log(body1);
        var arrayQuery=[];
        body1.body.map(function(data,index){
            var fault_id = data.fault_id == "" ? null : data.fault_id;
            var query = "REPLACE INTO faults_found (fault_id,version_id,module_id,fault_found)\
                        SELECT "+fault_id+",v.version_id,m.module_id,'"+data.fault_found+"' \
                        FROM module m,version v \
                        WHERE m.module_name = '"+data.module_name+"' AND v.version_id = "+data.version_id;
            console.log(query);
            arrayQuery.push(query)
        });

        var deleteQuery = 'Delete from fault_found where version_id ='+body1.version_id;
        console.log(deleteQuery);

                var query = '';
                if(arrayQuery.length>0) {
                    query = arrayQuery[0];
                    processAtDatabase(db,arrayQuery,query,res);
                }

    });

    function processAtDatabase(db,arrayQuery,query,res) {
        try{
            db.run(query,function(err){
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

};

