
exports.init = function(app,db) {

    app.post('/platformBoard',function(req,res){
        let body = req.body;

        let query = "INSERT INTO platform_board (`projectTitle1`,`indicator1`,`projectTitle2`,`indicator2`,`projectTitle3`,`indicator3`,`projectTitle4`,`indicator4`,`projectTitle5`,`indicator5`,`projectSummary`) VALUES ('"+ body.projectTitle1 + "','"+ body.indicator1 + "','"+ body.projectTitle2 + "','"+ body.indicator2 + "','"+ body.projectTitle3 + "','"+ body.indicator3 + "','"+ body.projectTitle4 + "','"+ body.indicator4 + "','"+ body.projectTitle5 + "','"+ body.indicator5 + "','"+ body.projectSummary + "')";

        try{
            db.run(query, function (error,response) {
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

    app.get('/platformBoard',function(req,res){
        let body = req.body;
        let query = "Select * from platform_board";
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

    app.put('/platformBoard',function (req,res) {
        let body = req.body;
        let id =  req.query['id'];

        let query = "Update platform_board set " +
            "projectTitle1='"+ body.projectTitle1 +"', indicator1='"+ body.indicator1 +"' , " +
            "projectTitle2='"+ body.projectTitle2 +"', indicator2='"+ body.indicator2 +"' , " +
            "projectTitle3='"+ body.projectTitle3 +"', indicator3='"+ body.indicator3 +"' , " +
            "projectTitle4='"+ body.projectTitle4 +"', indicator4='"+ body.indicator4 +"' , " +
            "projectTitle5='"+ body.projectTitle5 +"', indicator5='"+ body.indicator5 +"' , " +
            "projectSummary='"+ body.projectSummary +"' where id="+body.id+" ";
        try{
            db.run(query, function (error,response) {
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

    app.delete('/platformBoard',function (req,res){
        var id = req.query["id"];
        try{
            db.run("delete from platform_board where id =" + id, function (err, rows) {
                if (err) {
                    res.send("Internal Error"+err);
                } else {
                    res.send("Deleted");
                }
            });
        }catch(e){
            console.log(e);
        }
    });

};