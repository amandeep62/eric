
exports.init = function(app,db,jiraObj) {



    app.get("/capacityMetrics", function (req, res) {

        let jqlParam = req.query['jql'];
        let jqlFields = req.query['fields'];
        let maxResults = req.query['maxResults'];
        let versionId = req.query['versionId'];

        getCapacityMetricsFromDatabase(versionId,(result)=>{
            if( result.length==0){
                jiraObj.getCapacityMetrics(jqlParam,jqlFields,maxResults,(hoursFTEObject)=>{
                    var hoursDataJSONString = JSON.stringify(hoursFTEObject);
                    res.status(200).send(hoursFTEObject);
                    insertCapacityMetricsToDatabase(versionId,hoursDataJSONString,()=>{

                    });
                });
            }
            else{
                res.status(200).send(result[0].hoursDataJSONString);

                jiraObj.getCapacityMetrics(jqlParam,jqlFields,maxResults,(hoursFTEObject)=>{
                    var hoursDataJSONString = JSON.stringify(hoursFTEObject);
                    updateCapacityMetricsToDatabase(versionId,hoursDataJSONString,()=>{

                    });
                });
            }
        })


    });


    function getCapacityMetricsFromDatabase(versionId,callback){
        let query = "select hoursDataJSONString from capacity_metrics where version_id=?";
        try{
            db.all(query,[versionId], function (error,response) {
                if(error){
                    console.log('Error in capacity_metrics' + error);
                    callback(error);
                }else{
                    callback(response);
                }
            })
        }catch(e){
            console.log(e);
        }
    }


    function insertCapacityMetricsToDatabase(versionId,hoursDataJSONString,callback){
        let query = "insert into capacity_metrics(version_id, hoursDataJSONString) VALUES(?,?)";
        try{
            db.all(query,[versionId,hoursDataJSONString], function (error,response) {
                if(error){
                    console.log('Error in capacity_metrics' + error);
                    callback(error);
                }else{
                    callback("");
                }
            })
        }catch(e){
            console.log(e);
        }
    }

    function updateCapacityMetricsToDatabase(versionId,hoursDataJSONString,callback){
        let query = "update capacity_metrics set hoursDataJSONString = ? where version_id=?";
        try{
            db.all(query,[hoursDataJSONString,versionId], function (error,response) {
                if(error){
                    console.log('Error in capacity_metrics' + error);
                    callback(error);
                }else{
                    callback("");
                }
            })
        }catch(e){
            console.log(e);
        }
    }
};


