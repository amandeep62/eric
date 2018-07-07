exports.init = function(app,db) {
    var schedule = require('node-schedule');
    var salesforce = require('node-salesforce');


    var conn = new salesforce.Connection({
        loginUrl: 'https://udn.my.salesforce.com'
    });



    app.get("/testCP",function () {
        getCPsForOnboarding("00O36000007Af2yEAC",function(contentProviders) {

            var notInReport = [];

            db.all("SELECT name, customer_id, opportunity_id, handedOffSupport, CPBoost, TrialInProgress  FROM customer", function(err, rows) {
                if (!err) {
                    var localOpportunityIDS = rows.map(function(row) {return row.opportunity_id});
                    var RemoteOpportunityIDS = contentProviders.map(function(contentProvider){return contentProvider.opportunity_id})
                    contentProviders.forEach(function(contentProvider) {
                        var index = localOpportunityIDS.indexOf(contentProvider.opportunity_id);
                        var insertData = {
                            handedOffSupport: contentProvider.handedOffSupport == true ? 1 : 0 ,
                            CPBoost:contentProvider.CPBoost == true ? 1 : 0,
                            TrialInProgress: contentProvider.TrialInProgress == true ? 1 : 0,
                            opportunity_id: contentProvider.opportunity_id
                        };
                        if (index == -1) {
                            console.log(contentProvider.opportunity_id);
                            notInReport.push(contentProvider);
                        } else {
                            var query = "UPDATE customer SET handedOffSupport = ?, CPBoost = ?, TrialInProgress = ? WHERE opportunity_id = ?";
                            db.run(query, [insertData.handedOffSupport, insertData.CPBoost,
                                insertData.TrialInProgress, insertData.opportunity_id], function(err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                } else {
                    console.log(err);
                }
                console.log("Not in salesforce report"+ JSON.stringify(notInReport));

            });
            var date = new Date();
            console.log("Salesforce update finished " + date);
        });
    });

    var j = schedule.scheduleJob('0 0 0,6,12,18 * * *', function() {
        getSalesforceCPs("00O36000007D7CWEA0",function(contentProviders) {

            db.all("SELECT name, customer_id, salesforce_identifier, status, revenue, opportunity_id FROM customer", function(err, rows) {
                if (!err) {
                    var localSalesforceIDS = rows.map(function(row) {return row.salesforce_identifier;});
                    var RemoteSalesforceIDS = contentProviders.map(function(contentProvider){return contentProvider.salesforce_identifier})
                    rows.forEach(function(row){
                        var index = RemoteSalesforceIDS.indexOf(row.salesforce_identifier);
                        if(index == -1){
                            db.run("DELETE FROM customer where customer_id=?",[row.customer_id],function (err){
                                if(err){
                                    console.log(err);
                                }else{
                                    console.log("<" + row.name + ", " + row.salesforce_identifier +
                                        "> was deleted");
                                }
                            });
                        }
                    })
                    contentProviders.forEach(function(contentProvider) {
                        var index = localSalesforceIDS.indexOf(contentProvider.salesforce_identifier);
                        if (index == -1) {
                            db.run("INSERT INTO customer (revenue, name, status, salesforce_identifier, region,opportunity_id) VALUES (?, ?, ?, ?, ?, ?)",
                                [contentProvider.revenue, contentProvider.name,
                                    contentProvider.status, contentProvider.salesforce_identifier, contentProvider.region,contentProvider.opportunity_id], function(err) {
                                    if (err) {
                                        console. log(err + "<" + contentProvider.name + ", " + contentProvider.salesforce_identifier +
                                            ">");
                                    } else {
                                        console.log("<" + contentProvider.name + ", " + contentProvider.salesforce_identifier +
                                            "> was created");
                                    }
                                });
                        } else {
                            var query = "UPDATE customer SET revenue = ?, name = ?, status = ?, region = ?,opportunity_id = ? WHERE salesforce_identifier = ?";
                            db.run(query, [contentProvider.revenue, contentProvider.name,
                                contentProvider.status, contentProvider.region, contentProvider.opportunity_id, contentProvider.salesforce_identifier], function(err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                } else {
                    console.log(err);
                }
            });
            var date = new Date();
            console.log("Salesforce update finished " + date);
        });
    });

    function getSalesforceCPs(reportID,callback) {
        conn.login('alex.schemagin@ericsson.com', '21SalesforceX0mh4z3Rq7ulWESuNwati9h6n', function(err, userInfo) {
            if (err) {
                return console.error(err);
            }
            var reportId = reportID;//'00O36000007Af2yEAC';//'00O36000007D7CWEA0';
            var report = conn.analytics.report(reportId);
            report.execute({details: true}, function(err, result) {
                if (err) {
                    return console.error(err);
                }
                var filteredInformation = [];

                for(var key in result.factMap) {
                    var contentProviders = result.factMap[key].rows;
                    var keyIndex = key.split("!");
                    var region = null;
                    if(keyIndex[0] != "T"){
                        region = result.groupingsDown.groupings[keyIndex[0]].value;
                    }
                    contentProviders.forEach(function(element) {
                        var contentProvider = element.dataCells;
                        filteredInformation.push({
                            name: contentProvider[0].label,
                            salesforce_identifier: contentProvider[0].value,
                            status: contentProvider[2].value,
                            revenue: contentProvider[7].value,
                            region: region,
                            opportunity_id: contentProvider[1].value
                        });
                    });
                }

                callback(filteredInformation);

                conn.logout(function(err) {
                    if (err) {
                        return console.error(err);
                    }
                });
            });
        });
    }

    function getCPsForOnboarding(reportID,callback) {
        conn.login('alex.schemagin@ericsson.com', '21SalesforceX0mh4z3Rq7ulWESuNwati9h6n', function(err, userInfo) {
            if (err) {
                return console.error(err);
            }
            var reportId = reportID;
            var report = conn.analytics.report(reportId);
            report.execute({details: true}, function(err, result) {
                if (err) {
                    return console.error(err);
                }
                //console.log(JSON.stringify(result));
                var filteredInformation = [];

                for(var key in result.factMap) {
                    var contentProviders = result.factMap[key].rows;
                    contentProviders.forEach(function(element) {
                        var contentProvider = element.dataCells;
                        var cpBoostIdentifier = contentProvider[2].label.toUpperCase().includes("BOOST");

                        filteredInformation.push({
                            TrialInProgress: contentProvider[7].value,
                            CPBoost: cpBoostIdentifier,
                            handedOffSupport: contentProvider[20].value,
                            opportunity_id: contentProvider[2].value
                        });
                    });
                }
                callback(filteredInformation);

                conn.logout(function(err) {
                    if (err) {
                        return console.error(err);
                    }
                });
            });
        });
    }
};

