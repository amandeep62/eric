
exports.init = function(app,db) {

    app.get('/getProdReadiness',function(req,res){

        var query = "select t2. id,t1.id as product_title_id,t2.product_type,t2.product_year,t1.title as product_title,t2.target_quarter,t2.current_quarter,t2.upcoming_quarter,t2.next_quarter\n" +
            "from product_readiness_title t1 INNER JOIN \n" +
            "product_readiness t2 on (t1.id=t2.title_id)\n";
        //console.log('query-777--',query)
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

    app.get('/getProdReadinessTitle',function(req,res){

        var query = "select * from product_readiness_title";
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


    app.get('/deleteProdReadiness', function (req, res) {

        /* https://localhost/deleteProdReadiness?id=20 */

        var prodId = req.query["id"];
        var query = 'delete from product_readiness where id =' + prodId ;

        console.log(query);
        try{
            db.run(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    console.log('Delete rows from product Readiness >>>>>>>>>>>>>');
                    console.log(rows);
                    res.send("success");

                }
            });
        }catch(e){
            console.log(e);
        }

    });




    //single row edit via foreach
    app.post('/editProdReadiness', function (req, res) {

        /* https://localhost/editProdReadiness */
        var body = req.body;
        var bodyString = JSON.stringify(body);
        var editProductReadiness_procedureSQL =  "CALL editProductReadiness_procedure(?)";
        db.run(editProductReadiness_procedureSQL,[bodyString], function (err, rows) {
            if(err){
                res.status(200).send(err)
            }
            else{
                res.sendStatus(200);
            }

        })

    });

    app.post('/ProdReadinessTitle', function (req, res) {

        /* https://localhost/editProdReadiness */
        var body = req.body;
        var product_title = body.product_title;
        var product_readiness_titleSQL =  "CALL productReadinessTitleInsert_procedure(?)";
        db.run(product_readiness_titleSQL,[product_title], function (err, rows) {
            if(err){
                res.status(400).send(err)
            }
            else{
                res.sendStatus(201);

            }

        })

    });


    app.put('/ProdReadinessTitle', function (req, res) {

        /* https://localhost/editProdReadiness */
        var body = req.body;
        var product_title = body.product_title;
        var product_title_id = body.product_title_id;
        var product_readiness_titleSQL =  "UPDATE product_readiness_title set title=? where id=?";
        db.run(product_readiness_titleSQL,[product_title,product_title_id], function (err, rows) {
            if(err){
                res.status(400).send(err)
            }
            else{
                res.sendStatus(201);
            }

        })

    });


    app.delete('/ProdReadinessTitle', function (req, res) {

        /* https://localhost/deleteProdReadiness?id=20 */

        var id = req.query["id"];
        var query = 'delete from product_readiness_title where id =' + id ;

        console.log(query);
        try{
            db.run(query, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err)
                } else {
                    res.sendStatus(200);

                }
            });
        }catch(e){
            console.log(e);
        }

    });




};