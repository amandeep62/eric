
exports.init = function(app,db) {

    var fs = require('fs');
    var request = require('request');
    var https = require('https');
    var http = require('http');


    app.get('/DeleteReleaseTheme',function (req,res) {
        var theme = req.query['theme'];
        var version_id = req.query['version_id'];
        var query = "DELETE FROM release_scope WHERE release_theme='"+theme+"' and version_id='"+version_id+"'";

        try{
            db.run(query, function (error,response) {
            if(error){
                console.log('Error in release_phase' + error);
                res.send(error);
            }else{
                res.send("success");
            }
        });
        }catch(e){
            console.log(e);
        }
        
    });

    app.post('/addReleaseScopeRow',function (req,res) {

        var query = "REPLACE INTO release_scope (scope_id,version_id,module_id,release_theme,capabilities,description)\
                        SELECT "+req.body.scope_id+",'"+req.body.version_id+"', m.module_id,'"+req.body.release_theme+"','"+req.body.capabilities+"','"+req.body.description+"' \
                        FROM module m \
                        WHERE m.module_name = '"+ req.body.module_name +"'";
        try{
            db.run(query,function(err){
            if(err){
                console.log(err);
            }else{
                res.send("success");
            }
        })                
        }catch(e){
            console.log(e);
        }
        
    });

};

