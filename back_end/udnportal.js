/**
 * Created by Jeet-MP on 6/7/2017.
 */
/***
 *
 * @type {request}     : Importing request module and initialised to instance
 * @type {querystring} : Importing querystring module for getting query urls
 * @type {moment}      :  Importing moment module for time
 * @type {schedule}    :  Importing schedule module for running schedule
 */
let request = require('request');
let querystring = require('querystring');
let moment = require('moment');
let schedule = require('node-schedule');

/***
 * This module is for getting traffic data from rest api and inserting into db
 * @param app - Access to use express
 * @param db  - Access to db
 */
exports.init = function (app, db) {
    let endPoint = "https://api.ericssonudn.com/";
    /***
     *
     * @type {schedule.RecurrenceRule} : object to create a instance of scheduler
     */
    let rule = new schedule.RecurrenceRule();
   // rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    rule.hour = 23;
    rule.minute = 59;
    let j = schedule.scheduleJob(rule, function(){
        console.log("Begin to update UDN SP contribution data ...");
        updateUdnData();
    });

    function udnPortalLogin(callback) {
        //TODO: make username & password dynamic
        let username = "nishikant.deshmukh@ericsson.com";
        let password = "May21ips!";
        let format = "json";

        let body = {user_name: username, passwd: password, format: format};
        let formData = querystring.stringify(body);
        let contentLength = formData.length;


        let option = {
            url: endPoint + "analytics/auth/session/open/",
            headers: {
                "Connection": "keep-alive",
                "Content-Length": contentLength,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData,
            method: 'POST'
        };

        request(option, function (err, httpResponse, body) {
            if (err) {
                return console.error('failed:', err);
                callback(false);
            } else {
                if (httpResponse.statusCode == 200) {

                    let jsonObject = JSON.parse(body);

                    global.udnPortalAuthKey = jsonObject.udnSession;
                    console.log("udnSession"+global.udnPortalAuthKey);
                    callback(true);

                } else {
                    callback(false);
                }
            }

        });
    }

    let getUDNAccount = function (req, res, flag) {
        //Array for CP & SP data
        let spArray = {spDataObj: []};
        let cpArray = {cpDataObj: []};

        let option1 = {
            url: "https://portal.ericssonudn.com/v2/brands/udn/accounts?page_size=-1",
            headers: {
                "X-Auth-Token": "" + global.udnPortalAuthKey + ""
            },
            method: 'GET'
        };
        request(option1, function (err1, httpResponse1, body1) {
            if (err1) {
                res.send("error in response!");
            } else {
                if (httpResponse1.statusCode == "401") {
                    if (flag == true) {
                        res.send(body1);
                    } else {
                        udnPortalLogin(function (status) {
                            if (status) {
                                getUDNAccount(req, res, status)
                            } else {
                                res.send(status);
                            }
                        });
                    }
                } else if (httpResponse1.statusCode == "200") {
                    let completeObj = JSON.parse(body1);
                    let dataObj = completeObj.data;

                    for (var i in dataObj) {
                        if (dataObj[i].provider_type === 1) {
                            cpArray.cpDataObj.push(dataObj[i]);
                        }
                        else if (dataObj[i].provider_type === 2) {
                            spArray.spDataObj.push(dataObj[i]);
                        }
                    }
                    res.send({"CPData": cpArray, "SPData": spArray});
                }
            }

        })
    };
    app.get('/udnAccount', getUDNAccount);

    var checkUDNSession = function (req, res) {
        var option1 = {
            url: endPoint + "/analytics/auth/session/check",
            headers: {
                "X-Auth-Token": "" + global.udnPortalAuthKey + ""
            },
            method: 'GET'
        };
        request(option1, function (err1, httpResponse1, body1) {
            if (err1) {
                res.send("error in response!");
            } else {
                if (httpResponse1.statusCode == "400") {
                    res.send("Bad request!");
                } else if (httpResponse1.statusCode == "200") {
                    var bodyObj = JSON.parse(body1);
                    if (bodyObj.code == -1) {
                        udnPortalLogin(function (status) {
                            if (status) {
                                getUDNAccount(req, res)
                            }
                        });
                    } else {
                        var completeObj = JSON.parse(body1);
                        var session = completeObj.udnSession;
                        res.send({"udnSession": session});
                    }
                }
            }

        })
    }
    app.get('/checkSession', checkUDNSession);


    let getMetric = function (req, res) {
        let currentDate = new Date();
        let endDate = new Date();
        let startDate = new Date().setDate(currentDate.getDate() - 28);

        let bodyStr = "?start=" + req.query["cpStartDate"] + "&end=" + req.query["cpEndDate"] + "&list_children=true";

        let option1 = {
            url: endPoint + "analytics-legacy/metrics" + bodyStr,
            headers: {
                "X-Auth-Token": "" + global.udnPortalAuthKey + ""
            },
            method: 'GET'
        };
        request(option1, function (err1, httpResponse1, body1) {
            if (err1) {
                res.send("error in response!");
            } else {
                if (httpResponse1.statusCode == "400") {
                    res.send("Bad request!");
                } else if (httpResponse1.statusCode == "200") {
                    let bodyObj;
                    try {
                        bodyObj = JSON.parse(body1);
                    } catch (error) {
                        console.log("error in getting response : " + err1);
                    }

                    if (!bodyObj) {
                        udnPortalLogin(function (status) {
                            if (status) {
                                getMetric(req, res)
                            }
                        });
                    } else {
                        res.send(body1);
                    }
                }
            }

        })
    }

    app.get('/getMetric', getMetric);

       let getTrafficByTime = function (req, res, flag) {
           let trafficArray = {details: []};

           let start = new Date().getTime();
        start = req.query["cpStartDate"];

           let option1 = {
            url: "https://portal.ericssonudn.com/analytics/traffic/get-by-time/?start="
            + start + "&udnSession=af554145f40845c79c19acb42f002e23",
            headers: {
                "X-Auth-Token": "" + global.udnPortalAuthKey + ""
            },
            method: 'GET'
        };
        request(option1, function (err1, httpResponse1, body1) {

            if (err1) {
            } else {
                if (httpResponse1.statusCode == "401") {
                    if (flag == true) {
                        let setflag = true;
                        this.getTrafficByTime(req, res, setflag);
                    } else {
                        res.send("error");
                    }
                }
                else if (httpResponse1.statusCode == "200") {
                    let completeObj = JSON.parse(body1);
                    let dataObj = completeObj.data;
                    for (let i in dataObj) {
                        trafficArray.details.push(dataObj[i]);
                    }
                    res.send({"data": trafficArray});
                }

            }

        })
    }

    app.get('/udnTrafficByTime', getTrafficByTime);
    let getSpContribution = function (req, res) {
        let currentDate = new Date();
        let endDate = new Date();
        var bodyStr = "?start=" + req.query["cpStartDate"];
        //https://portal.ericssonudn.com/analytics/
        // traffic/get-sp-contribution/?start=1483228800&end=
        // 1485043199&granularity=day
        let option1 = {
            url: endPoint + "/analytics/traffic/get-cp-contribution/?" +
            "granularity=day&start=" +  req.query["cpStartDate"] +
            "&end=" + req.query["cpEndDate"] + "&show_detail=true",
            headers: {
                "X-Auth-Token": "" + global.udnPortalAuthKey + ""
            },
            method: 'GET'
        };
        request(option1, function (err1, httpResponse1, body1) {
            if (err1) {
                res.send("error in response!");
            } else {
                if (httpResponse1.statusCode == "400") {
                    res.send("Bad request!");
                } else if (httpResponse1.statusCode == "200") {
                    var bodyObj;
                    try {
                        bodyObj = JSON.parse(body1);
                    } catch (error) {
                        console.log("error in getting response : " + err1);
                    }

                    if (!bodyObj) {
                        udnPortalLogin(function (status) {
                            if (status) {
                                getMetric(req, res)
                            }
                        });
                    } else {
                        res.send(body1);
                    }
                }
            }

        })
    }

    app.get('/udnTrafficByGroup', getSpContribution);


    app.get('/getSpContribution', getSpContribution);

    let getSPContributionForCP = function(cpAccount,startDate,endDate,callback){
        let bodyStr = "?start=" + startDate + "&end="
            + endDate + "&account="+ cpAccount
            +"&show_detail=true&granularity=day";
        let option1 = {

            url: "https://portal.ericssonudn.com/analytics/traffic/get-sp-contribution/" + bodyStr,
            headers: {
                "X-Auth-Token": "" + global.udnPortalAuthKey + ""
            },
            method: 'GET'
        };
        request(option1, function (err1, httpResponse1, body1) {
            if (err1) {
                // res.send("error in response!");
                console.log('err1',err1)
            } else {
                if (httpResponse1.statusCode == "400") {
                    // res.send("Bad request!");
                } else if (httpResponse1.statusCode == "200") {
                    var bodyObj;
                    try {
                        bodyObj = JSON.parse(body1);
                    } catch (error) {
                        console.log("error in getting response : " + err1);
                    }

                    if (!bodyObj) {
                        udnPortalLogin(function (status) {
                            if (status) {
                                getSPContributionForCP(cpAccount,startDate,endDate,callback)
                            }
                        });
                    } else {
                        console.log("====================" + JSON.stringify(bodyObj));
                        var spForCP = [];
                        bodyObj.data.details.map(function(details){
                            details.account = cpAccount;
                        });

                        callback(bodyObj.data.details);
                        //res.send(body1);
                    }
                }
            }

        })
    }


    function getSPTrafficContribution(req, res, epochDate, callback){//req, res) {

        let startOfDay = epochDate;//Math.floor(moment.utc().subtract('1','day').startOf("day")/1000);
        let endOfDay = epochDate;//Math.floor(moment.utc().subtract('1','day').endOf("day")/1000);
        let bodyStr = "?start=" + startOfDay + "&end=" + endOfDay + "&entity=accounts";
        let option1 = {
            url: "https://portal.ericssonudn.com/analytics/traffic/get-cps-for-sp/" + bodyStr,
            headers: {
                "X-Auth-Token": "" + global.udnPortalAuthKey + ""
            },
            method: 'GET'
        };
        //console.log(bodyStr);
        request(option1, function (err1, httpResponse1, body1) {
           // console.log(body1);
            if (err1) {
                res.send("error in response!");
            } else {
                if (httpResponse1.statusCode === "400") {
                    res.send("Bad request!");
                } else if (httpResponse1.statusCode === "200") {
                    let bodyObj;
                    try {
                        bodyObj = JSON.parse(body1);
                    } catch (error) {
                        console.log("error in getting response : " + err1);
                    }

                    if (!bodyObj) {
                        udnPortalLogin(function (status) {
                            if (status) {
                                getSPTrafficContribution(req,res,epochDate,callback)
                            }
                        });
                    } else {
                        let spForCP = [];
                        let count = 0;
                        let  bodyLen = bodyObj.data.length;

                        bodyObj.data.map(function(cpAccount){

                            getSPContributionForCP(cpAccount.id,epochDate,epochDate,function(result){
                                spForCP.push(result);
                                count++;
                                if(bodyLen == count){
                                    insertNewCP(bodyObj.data,spForCP,function(){
                                        callback(epochDate);
                                    });

                                }
                            });
                        });

                    }
                }
            }

        })
    }

    app.get('/getSPTrafficContribution', getSPTrafficContribution);

    /****
     *
     * @param db
     * @param arrayQuery
     * @param query
     * @param callback
     */
    function processAtDatabase(db,arrayQuery, query, callback) {
        try{
            //console.log(query);
            db.run(query, function(err){
                if(err){
                    //console.log(query);
                    //console.log(err);
                }else{
                    //res.send("success");
                }
                arrayQuery.shift();
                if(arrayQuery.length > 0){
                    query = arrayQuery[0];
                    processAtDatabase(db,arrayQuery,query,callback);
                }
                else{
                    callback("success");
                }

            });
        }catch(e){
            console.log(e);
        }

    }

    /***
     *
     * @param cpList
     * @param spContribution
     * @param callback
     */
    function insertNewCP(cpList, spContribution, callback){
        let body1 = cpList;
        //console.log(body1);
        let arrayQuery = [];
        body1.map(function(data,index){
            var fault_id = data.fault_id == "" ? null : data.fault_id;

            var query = "INSERT INTO cp_account(cp_account_id, cp_account_name)" +
                " VALUES (" + data.id + ",'" + data.name + "')" +
                " ON DUPLICATE KEY UPDATE" +
                " cp_account_name = '" + data.name + "'";
            arrayQuery.push(query)
        });
        let query = '';
        if(arrayQuery.length > 0) {
            query = arrayQuery[0];
            processAtDatabase(db, arrayQuery, query, (result)=>{
                if(result == "success"){
                    storeSPContributionData(spContribution, function(){
                        callback();
                    });
                }
            });
        }
    }

    /***
     *
     * @param spContribution
     * @param callback
     */
    function storeSPContributionData(spContribution, callback){
        let spContributionArray = spContribution;
        let arrayQuery = [];
        let count = 0;
        let date = null;
        spContributionArray.map(function(records){

            records.map(function(recordCol){
                var fault_id = recordCol.fault_id == "" ? null : recordCol.fault_id;
                recordCol.detail.map(function(data2){
                    date = data2.timestamp;
                    var query = " INSERT INTO `traffic_cp_contribution` \
                    (`details_sp_group`,`details_percent_total`,\
                    `details_bytes`,`details_property`,\
                        `details_name`,`details_sp_account`,\
                        `details_asset`,`details_account`,\
                        `details_group`,`details_countries_code`,\
                        `details_countries_percent_total`,\
                        `details_countries_bytes`,\
                        `details_countries_name`,\
                        `details_countries_bits_per_second`,\
                        `details_http_net_off_bytes`,\
                        `details_http_net_on_bytes`,\
                        details_http_net_on_bps,details_http_net_off_bps,\
                        details_https_net_off_bytes,\
                        details_https_net_on_bytes,\
                        details_https_net_on_bps,\
                        details_https_net_off_bps,\
                        details_detail_percent_of_entity,\
                        details_detail_bytes,details_detail_percent_of_timestamp,\
                        details_detail_bits_per_second,details_detail_timestamp) \
                        VALUES \
                        ('"   +      recordCol.sp_group      +
                        "','" +      recordCol.percent_total + "',\
                        "     +      recordCol.bytes         + "," +
                        "'"   +      recordCol.property      + "'," +
                        "'"   +      recordCol.name          + "'," +
                        ""    +      recordCol.sp_account    + ",'" +
                        ""    +      recordCol.asset         + "',"
                              +      recordCol.account       + ",\
                        '"    +      recordCol.group          + "'," +
                        "'NULL',null,null,null,null,'"
                        + recordCol.http.net_off_bps      + "','"
                        +       recordCol.http.net_on_bytes     + "',\
                        '"    + recordCol.http.net_on_bps       + "','"
                        + recordCol.http.net_off_bps      + "'," +
                        "'"   + recordCol.https.net_off_bps     + "'," +
                        "'"   + recordCol.https.net_on_bytes    + "',\
                        '"    + recordCol.https.net_on_bps      + "'," +
                        "'"   + recordCol.https.net_off_bps     + "'," +
                        "'"   + data2.percent_of_entity    + "'," +
                        ""    + data2.bytes                + ",\
                        '"    + data2.percent_of_timestamp + "'," +
                        ""    + data2.bits_per_second      + "," +
                        ""    + data2.timestamp            +
                        ")";

                    count++;

                    arrayQuery.push(query);
                });
            });

        });

        console.log(count);

        var query = '';
        if(arrayQuery.length>0) {
            query = arrayQuery[0];
            processAtDatabase(db,arrayQuery,query,function(result){
                if(result == "success"){
                    console.log("CP contribution data updated successfully");
                    callback();
                }
            });
        }

    }

    /***
     *
     * @param epochDate
     * @param callback
     */
    function fetchSPTrafficContribution(epochDate, callback){//req, res) {

        let startOfDay = epochDate;//Math.floor(moment.utc().subtract('1','day').startOf("day")/1000);
        let endOfDay = epochDate;//Math.floor(moment.utc().subtract('1','day').endOf("day")/1000);
        let bodyStr = "?start=" + startOfDay + "&end=" + endOfDay + "&entity=accounts";
        let option1 = {
            url: "https://portal.ericssonudn.com/analytics/traffic/get-cps-for-sp/" + bodyStr,
            headers: {
                "X-Auth-Token": "" + global.udnPortalAuthKey + ""
            },
            method: 'GET'
        };
      //  console.log(bodyStr);
        request(option1, function (err1, httpResponse1, body1) {
           // console.log(body1);
            if (err1) {
                return err1;
            } else {
                if (httpResponse1.statusCode == "400") {
                    return "400";
                } else if (httpResponse1.statusCode == "200") {
                    var bodyObj;
                    try {
                        bodyObj = JSON.parse(body1);
                    } catch (error) {
                        console.log("error in getting response : " + err1);
                    }

                    if (!bodyObj) {
                        udnPortalLogin(function (status) {
                            if (status) {
                                fetchSPTrafficContribution(epochDate,callback)
                            }
                        });
                    } else {
                        let spForCP = [];
                        let count    = 0;
                        let  bodyLen = bodyObj.data.length;

                        bodyObj.data.map(function(cpAccount){

                            getSPContributionForCP(cpAccount.id,epochDate,epochDate,function(result){
                                spForCP.push(result);
                                count++;
                                if(bodyLen == count){
                                    insertNewCP(bodyObj.data,spForCP,function(){
                                        callback(epochDate);
                                    });

                                }
                            });
                        });

                    }
                }
            }

        })
    }

    /***
     *
     * @param startDate
     * @param count
     * @param callback
     */
    function getContribution(startDate, count, callback){
        let epochOldDate = moment.unix(startDate);
        let date = moment.utc(epochOldDate).add('1', 'day').startOf("day");
        let epochDate = Math.floor(date / 1000);
        console.log(epochDate);
        count++;
        fetchSPTrafficContribution(epochDate, function(nextEpochDate){
            try {
                console.log("loop=" + nextEpochDate);
                if (nextEpochDate && epochDate && nextEpochDate < epochDate) {
                    getContribution(nextEpochDate, count, callback);
                } else {
                    callback(count);
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }

    function updateUdnData() {
        let startDate = Math.floor(moment.utc().subtract('1', 'day').startOf("day") / 1000);
        console.log(startDate);
        getContribution(startDate, 0, function(count){
            console.log("count=" + count);
        })
    }

    let callloop = function(req, res){
       let startDate = Math.floor(moment.utc().subtract('1', 'day').startOf("day") / 1000);
        getContribution(startDate, 0, function(count){
            console.log("count=" + count);
        })
    };

    app.get("/runSchedulerManually", callloop);
};

