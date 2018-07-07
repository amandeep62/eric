/**
 * Created by Jeet-MP on 6/7/2017.
 */

var request = require('request');
var rp = require('request-promise');
var querystring = require('querystring');
var moment = require('moment');
var md5 = require('md5');
var schedule = require('node-schedule');


exports.init = function (app, db) {
    var endPoint = "https://api.ericssonudn.com/";
    var username = "elmeast";
    var password = "Elm@9!#8%AstE]";
    var salt = "7$#%GR$10(&@#_*%)";


    //-------------schedular-------------//

    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(1, 6)];
    rule.hour = 1;
    rule.minute = 0;

    var j = schedule.scheduleJob(rule, function(){
        var date = moment.utc().subtract('1','day').format('YYYYMMDD').toString();
        chinaUdnAPILogin(date,function (data) {
            console.log(data);
        });
    });

    //----------------------------------//



    app.get("/getChinaTrafficByTime",testChina);

    function testChina(req,res) {
        var date = moment.utc().subtract('1','day').format('YYYYMMDD').toString();
        chinaUdnAPILogin(date,function(data){
            res.send(data);
        });
    }

    function chinaUdnAPILogin(startDate,callback) {

        var chinaTime = moment.tz(new Date(), "Asia/Shanghai").format('YYYYMMDD').toString();
        var hashValue = md5(username+password+salt+chinaTime);
        var option1 = {
            url: "http://api.elmeast.com.cn/auth/cp",
            headers: {
                "Content-type":"application/json",
                "access-token":hashValue
            },
            method: 'POST'
        };

        request(option1, function (err1, httpResponse1, body1) {
            if (err1) {
                callback("error in response!");//res.send("error in response!");
            } else {
                if (httpResponse1.statusCode == "400") {
                    callback("Bad request!");//res.send("Bad request!");
                } else if (httpResponse1.statusCode == "200") {
                    var bodyObj;
                    try {
                        bodyObj = JSON.parse(body1);
                    } catch (error) {
                        console.log("error in getting response : " + err1);
                    }

                    if (!bodyObj) {
                        console.log("error"+ body1);
                    } else {
                        var spForCP = [];
                        var count=0;
                        var  bodyLen = bodyObj.length;

                        bodyObj.map(function(cpAccount){

                            getChinaSPContributionForCP(cpAccount,startDate,function(result){
                                spForCP.push({
                                    cpName: cpAccount,
                                    list: result
                                });
                                count++;
                                if(bodyLen == count){
                                    storeChinaSPContributionData(spForCP,function () {
                                        var date = startDate+1;
                                        if(date >= startDate){
                                            chinaUdnAPILogin(date,callback);
                                        }
                                        else{
                                            callback("Completed");
                                        }

                                    });

                                }
                            });
                        });

                    }
                }
            }

        })
    }

    var getChinaSPContributionForCP = function(cpAccount,date,callback){

        var chinaTime = moment.tz(new Date(), "Asia/Shanghai").format('YYYYMMDD').toString();
        var hashValue = md5(username+password+salt+chinaTime);
        var startDate = date;//moment.utc().subtract('1','day').format('YYYYMMDD').toString();
        var endDate = date;//moment.utc().format('YYYYMMDD').toString();



        var option1 = {
            url: 'http://api.elmeast.com.cn/offload/info',
            method: 'POST',
            headers:
                {
                    'content-type': 'application/x-www-form-urlencoded' },
            form:
                { start: startDate,
                    end: endDate,
                    cp: cpAccount,
                    token: hashValue }
        };

        request(option1, function (err1, httpResponse1, body1) {
            if (err1) {
                console.log("error in response"+JSON.stringify(err1));
            } else {
                if (httpResponse1.statusCode == "400") {
                    console.log("Bad request!");
                } else if (httpResponse1.statusCode == "200") {
                    var bodyObj;
                    try {
                        bodyObj = JSON.parse(body1);
                    } catch (error) {
                        console.log("error in getting response : " + err1);
                    }

                    if (!bodyObj) {
                        console.log("error"+ err1);
                    } else {
                        var spForCP = [];
                        callback(bodyObj.data.list);
                    }
                }
            }

        })
    }



    function processAtDatabase(db,arrayQuery,query,callback) {
        try{
            db.run(query,function(err, rows){
                arrayQuery.shift();
                if(arrayQuery.length>0){
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

    function storeChinaSPContributionData(spContribution,callback){
        var body1 = spContribution;
        var arrayQuery=[];
        body1.map(function(data,index){
            if(data.list){
                data.list.map(function(list,index){
                    var query = "INSERT INTO `cp_china_traffic` (chinaCpName,chinaSpName,timeStamp,traffic_total) \
                            VALUES ('"+data.cpName+"','"+list.cdn+"',"+list.time+","+list.flow+")";
                    arrayQuery.push(query)
                });
            }



        });

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


}