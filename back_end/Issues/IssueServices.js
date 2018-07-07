var schedule = require('node-schedule');
exports.init = function(app,db,jiraObj) {

    Date.prototype.getWeek = function() {
        var determinedate = new Date();
        determinedate.setFullYear(this.getFullYear(), this.getMonth(), this.getDate());
        var D = determinedate.getDay();
        if(D == 0) D = 7;
        determinedate.setDate(determinedate.getDate() + (4 - D));
        var YN = determinedate.getFullYear();
        var ZBDoCY = Math.floor((determinedate.getTime() - new Date(YN, 0, 1, -6)) / 86400000);
        var WN = 1 + Math.floor(ZBDoCY / 7);
        return WN;
    }

    function getDateRangeOfWeek(weekNo){
        var d1 = new Date();
        var numOfdaysPastSinceLastMonday = eval(d1.getDay()- 1);
        d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
        var weekNoToday = d1.getWeek();
        var weeksInTheFuture = eval( weekNo - weekNoToday );
        d1.setDate(d1.getDate() + eval( 7 * weeksInTheFuture ));
        var rangeIsFrom =  d1.getFullYear() +"-" + eval(d1.getMonth()+1) + "-" + d1.getDate();
        d1.setDate(d1.getDate() + 6);
        var rangeIsTo = d1.getFullYear() +"-" + eval(d1.getMonth()+1)  + "-" + d1.getDate() ;

        return {weekStartDate:rangeIsFrom, weekEndDate:rangeIsTo};
    }

    function weeks_between(date1, date2) {
        // The number of milliseconds in one week
        var ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
        // Convert both dates to milliseconds
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();
        // Calculate the difference in milliseconds
        var difference_ms = Math.abs(date1_ms - date2_ms);
        // Convert back to weeks and return hole weeks
        return Math.floor(difference_ms / ONE_WEEK);
    }


    var TYPE = {MONTHLY:1,QUARTERLY:2,YEARLY:3,WEEKLY:4,DAILY:5}

    /*var j = schedule.scheduleJob('*!/10 * * * *', function(){
        let date = new Date();
        var todayDate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
        var dateStr = 'AND ((created >="'+todayDate+' 00:00") OR (updated >="'+todayDate+' 00:00") OR (resolved >="'+todayDate+' 00:00"))'
        getIssuesFromJIRA(0,jiraObj,dateStr);
    });*/

    /*var k = schedule.scheduleJob('* * 06 * *', function(){

        var dateStr = ''
        getIssuesFromJIRA(0,jiraObj,dateStr);
    });*/

    Date.prototype.MonthsBetween = function(){
        var date1,date2,negPos;
        if(arguments[0] > this){
            date1 = this;
            date2 = arguments[0];
            negPos = 1;
        }
        else{
            date2 = this;
            date1 = arguments[0];
            negPos = -1;
        }

        if(date1.getFullYear() == date2.getFullYear()){
            return negPos * (date2.getMonth() - date1.getMonth());
        }
        else{
            var mT = 11 - date1.getMonth();
            mT += date2.getMonth() + 1;
            mT += (date2.getFullYear() - date1.getFullYear() - 1) * 12;
            return negPos * mT;
        }

    }


    var lastday = function(y,m){
        return  new Date(y, m +1, 0).getDate();
    }
    app.get("/serverDate", function (req, res) {
        let date = new Date();
        var startTrendDate = (date.getFullYear()-1) + "-" + (date.getMonth()+1) + "-" + date.getDate();
        var endTrendDate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
        res.status(200).send({startTrendDate:startTrendDate,endTrendDate:endTrendDate});
    })


    app.get("/getwebhookfilecontent", function (req, res) {
        var fs = require('fs');

        var path = 'webhookdata.txt';
        if (fs.existsSync(path)) {
            // Do something
            fs.readFile(path, 'utf8', function(err, contents) {
                res.status(200).send(contents)

            });
        }
        else{
            res.status(200).send("no webhook pushnotification")
        }

    })


    app.get("/rest/webhooks/pushnotification", function (req, res) {
        var fs = require('fs')
        var date = new Date();
        var bodyStr = "webhook on get" + date.toISOString();;

        if(req.body){
            bodyStr = bodyStr + JSON.stringify(req.body);
        }

        fs.writeFile('webhookdata.txt', bodyStr, function (err) {
            if (err) return console.log(err);

        });
        res.status(200).send("OK");
    })

    app.post("/rest/webhooks/pushnotification", function (req, res) {
            var date = new Date();
        var fs = require('fs')
        var bodyStr = "webhook on post "+ date.toISOString();

        if(req.body){
            bodyStr = bodyStr + JSON.stringify(req.body);
        }

        fs.writeFile('webhookdata.txt', bodyStr, function (err) {
            if (err) return console.log(err);

        });
        res.status(200).send("received")
    })

    app.put("/rest/webhooks/pushnotification", function (req, res) {

        var fs = require('fs')
        var bodyStr = "webhook on put";

        if(req.body){
            bodyStr = bodyStr + JSON.stringify(req.body);
        }

        fs.writeFile('webhookdata.txt', bodyStr, function (err) {
            if (err) return console.log(err);

        });

        res.status(200).send("received")
    })


    app.get("/trendsByType", function (req, res) {
        var project=req.query.project;
        var startDate =req.query.startDate;
        var endDate =req.query.endDate;
        var trendsType=req.query.trendsType;
        var type = 1;
        if(trendsType=="Yearly"){
                    type=1;
                } else if(trendsType=="Monthly"){
                    type=2;
                } else if(trendsType=="Quarterly"){
                    type=3;
                } else if(trendsType=="Weekly"){
                    type=4;
                } else if(trendsType=="Daily"){
                    type=5;
                }

        var trendsType_procedureSQL =  "CALL trend_inflow_outflow_backlog_procedure(?,?,?,?)";
        if(startDate && endDate && project && type) {
            db.run(trendsType_procedureSQL, [project, startDate, endDate, type], function (err, rows) {
                if (err) {
                    res.status(400).send(err);
                }
                else {

                    //0 index is in flow, 1 is ouflow 2 is backlog
                    var inflow = rows[0];
                    var outflow = rows[1];
                    var backlog = rows[2];
                    var allResult = {inflow: inflow, outflow: outflow, backlog: backlog};
                    res.status(200).send(allResult);
                }

            })
        }
        else{
            res.status(400).send("project, startDate, endDate,trendsType are mandatory fields");
        }


    });


    app.get("/trendsBacklog", function (req, res) {
        var project=req.query.project;
        var startDate =req.query.startDate;
        var endDate =req.query.endDate;
        var trendsType=req.query.trendsType;
        var type = 1;
        if(trendsType=="Yearly"){
            type=1;
        } else if(trendsType=="Monthly"){
            type=2;
        } else if(trendsType=="Quarterly"){
            type=3;
        } else if(trendsType=="Weekly"){
            type=4;
        } else if(trendsType=="Daily"){
            type=5;
        }

        var trendsType_procedureSQL =  "CALL trend_triage_dev_intest_backlog_procedure(?,?,?,?)";
        if(startDate && endDate && project && trendsType) {
            db.run(trendsType_procedureSQL, [project, startDate, endDate, type], function (err, rows) {
                if (err) {
                    res.status(400).send(err);
                }
                else {
                    //0 index is in flow, 1 is ouflow 2 is backlog
                    var triage = rows[0];
                    var dev = rows[1];
                    var intest = rows[2];
                    var backlog = rows[3];
                    var allResult = {triage: triage, dev: dev,intest:intest, backlog: backlog};
                    res.status(200).send(allResult);
                }

            })
        }
        else{
            res.status(400).send("project, startDate, endDate,trendsType are mandatory fields");
        }
    })


    app.get("/trendsInflowOutflowBacklogs", function (req, res) {
        var project=req.query.project;
        var startDate =req.query.startDate;
        var endDate =req.query.endDate;
        var trendsType=req.query.trendsType;
        var type = 1;
        if(trendsType=="Yearly"){
            type=1;
        } else if(trendsType=="Monthly"){
            type=2;
        } else if(trendsType=="Quarterly"){
            type=3;
        } else if(trendsType=="Weekly"){
            type=4;
        } else if(trendsType=="Daily"){
            type=5;
        }

        var trendsType_procedureSQL =  "CALL trend_triage_dev_intest_backlog_inflow_outflow_procedure(?,?,?,?)";
        if(startDate && endDate && project && trendsType) {
            db.run(trendsType_procedureSQL, [project, startDate, endDate, type], function (err, rows) {
                if (err) {
                    res.status(400).send(err);
                }
                else {
                    //0 index is in flow, 1 is ouflow 2 is backlog
                    var triage = rows[0];
                    var dev = rows[1];
                    var intest = rows[2];
                    var backlog = rows[3];
                    var inflow = rows[4];
                    var outflow = rows[5];
                    var allResult = {triage: triage, dev: dev,intest:intest, backlog: backlog,inflow: inflow, outflow: outflow, backlog: backlog};
                    res.status(200).send(allResult);
                }

            })
        }
        else{
            res.status(400).send("project, startDate, endDate,trendsType are mandatory fields");
        }
    })


    // app.get("/trendsByType", function (req, res) {
    //
    //     var fs = require('fs')
    //     req.session.sent=false;
    //
    //     let date = new Date();
    //
    //     var startTrendDate = (date.getFullYear()-1) + "-" + (date.getMonth()+1) + "-" + date.getDate();
    //     var endTrendDate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
    //     var startTrendDateDayNext = (date.getFullYear()-1) + "-" + (date.getMonth()+1) + "-" + (date.getDate()+1);
    //     var endTrendDateDayNext = date.getFullYear() + "-" + (date.getMonth()+1) + "-" +(date.getDate()+1);
    //     if(req.query.project == "DevOps,CDX,DOC,LB,MON,UDNP,CIS,CS,RENG,AN" &&
    //         req.query.trendsType=="Monthly" &&
    //         (req.query.startDate == startTrendDate && req.query.endDate == endTrendDate ||
    //             req.query.startDate == startTrendDateDayNext && req.query.endDate == endTrendDateDayNext
    //
    //         )
    //     ){
    //
    //         if (fs.existsSync("chart1data.json")) {
    //             var chart1content = fs.readFileSync("chart1data.json", 'utf8');
    //             var jsonChart1 = JSON.parse(chart1content);
    //             res.status(200).send(jsonChart1);
    //             req.session.sent=true;
    //         }
    //     }
    //
    //     if(req.session.result){
    //         // req.session.result.backlog.splice(0,req.session.result.length);
    //         // req.session.result.inflow.splice(0,req.session.result.length);
    //         // req.session.result.outflow.splice(0,req.session.result.length);
    //     }
    //     req.session.result={backlog:[],inflow:[],outflow:[]};
    //     req.query.startDate= req.query.startDate.replace(/(^|-)0+/g, "$1")
    //     req.query.endDate= req.query.endDate.replace(/(^|-)0+/g, "$1")
    //
    //     var startInputDate = new Date(req.query.startDate);
    //     var endInputDate = new Date(req.query.endDate);
    //     req.session.monthCount =startInputDate.MonthsBetween(endInputDate)+1;
    //     var startYear = startInputDate.getFullYear();
    //     var endYear = endInputDate.getFullYear()
    //     var project = req.query.project;
    //     var trendsType = req.query.trendsType;
    //     var type=1;
    //     if(trendsType=="Monthly"){
    //         type=1;
    //     } else if(trendsType=="Quarterly"){
    //         type=2;
    //     } else if(trendsType=="Yearly"){
    //         type=3;
    //     } else if(trendsType=="Weekly"){
    //         type=4;
    //     } else if(trendsType=="Daily"){
    //         type=5;
    //     }
    //
    //
    //     var projectArray;
    //     if(project.includes(",")){
    //         projectArray = project.split(",");
    //         project = "'" + projectArray.join("','") + "'"
    //     }
    //
    //     var inputJQL = [];
    //         var month=startInputDate.getMonth()+1;
    //        var yearCounter = startYear;
    //
    //     if (type==TYPE.QUARTERLY){
    //         var startMonthDate = new Date(req.query.startDate);
    //         var endMonthDate = new Date(req.query.endDate);
    //         var startQuarter=1;
    //         var startQuarterMonth=1;
    //         var endQuarterMonth=1;
    //
    //         while(startMonthDate <= endMonthDate) {
    //             var month1 = startMonthDate.getMonth() + 1;
    //             var year1 = startMonthDate.getFullYear();
    //
    //             if(month1==1 || month1==2 || month1==3){
    //                 startQuarter=1;
    //                 startQuarterMonth=1;
    //                 endQuarterMonth=3;
    //             }
    //             else if(month1==4 || month1==5 || month1==6){
    //                 startQuarter=2;
    //                 startQuarterMonth=4;
    //                 endQuarterMonth=6;
    //             }
    //             else if(month1==7 || month1==8 || month1==9){
    //                 startQuarter=3;
    //                 startQuarterMonth=7;
    //                 endQuarterMonth=9;
    //             }
    //             else if(month1==10 || month1==11 || month1==12){
    //                 startQuarter=4;
    //                 startQuarterMonth=10;
    //                 endQuarterMonth=12;
    //             }
    //
    //             var lastDay = lastday(startMonthDate.getFullYear(), startMonthDate.getMonth())
    //
    //             var firstDay = 1;
    //             if(startInputDate.getMonth()+1==month){
    //                 firstDay = startInputDate.getDate();
    //             }
    //
    //             var startCreatedDate = new Date(year1, startQuarterMonth-1, 1);
    //             var endCreatedDate = new Date(year1, startCreatedDate.getMonth()+3 , 0);
    //             startCreatedDate = startCreatedDate.getFullYear()+"-"+(startCreatedDate.getMonth()+1)+"-"+startCreatedDate.getDate();
    //             endCreatedDate = endCreatedDate.getFullYear()+"-"+(endCreatedDate.getMonth()+1)+"-"+endCreatedDate.getDate();
    //
    //             var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was not "Done"  on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //             var jqlObj = {jqlStr: jqlStr, month: startQuarter, year: year1,type:"backlog"};
    //             inputJQL.push(jqlObj);
    //
    //             var jqlInflowStr = 'project IN (' + project + ') AND issuetype in ("Problem","bug") AND created >="' + startCreatedDate +'" AND created <="' + endCreatedDate + '" ORDER BY created'
    //             var jqlObj = {jqlStr: jqlInflowStr, month: startQuarter, year: yearCounter,type:"inflow"};
    //             inputJQL.push(jqlObj);
    //
    //             var jqlOutflowStr = 'project IN('+project+') AND issuetype in ("Problem","bug") AND status changed to "Done" before "'+endCreatedDate+'" after "'+startCreatedDate + '"ORDER BY updatedDate';
    //             var jqlObj = {jqlStr: jqlOutflowStr, month: startQuarter, year: yearCounter,type:"outflow",start:startCreatedDate,end:endCreatedDate};
    //             inputJQL.push(jqlObj);
    //
    //
    //             var newDate = startMonthDate.setMonth(startMonthDate.getMonth() + 3);
    //             startMonthDate = new Date(newDate);
    //         }
    //     }
    //
    //      while(yearCounter<=endYear) {
    //             var startDateForYear = new Date(month+"/1/"+yearCounter);
    //             var endDateForYear =  new Date("12/31/"+yearCounter);
    //             if(endDateForYear>=endInputDate) {
    //                 endDateForYear = endInputDate;
    //             }
    //             var numberOfMonthsForYears = startDateForYear.MonthsBetween(endDateForYear)+1;
    //
    //             if(type==TYPE.MONTHLY) {
    //                 var startMonth = month;
    //                 for (var i = month; i < numberOfMonthsForYears+startMonth; i++) {
    //
    //                     var lastDay = lastday(yearCounter, month - 1)
    //                     var firstDay = 1;
    //                     if(startInputDate.getMonth()+1==month){
    //                         firstDay = startInputDate.getDate();
    //                     }
    //                     var startCreatedDate = yearCounter + "-" + month + "-"+firstDay;
    //                     var endCreatedDate = yearCounter + "-" + month + "-"+ lastDay;
    //                     var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was not "Done"  on "' + endCreatedDate + '" AND created <"' + endCreatedDate + '" ORDER BY updatedDate'
    //                     var jqlObj = {jqlStr: jqlStr, month: month, year: yearCounter,type:"backlog"};
    //                     inputJQL.push(jqlObj);
    //
    //                     var jqlInflowStr = 'project IN (' + project + ') AND issuetype in ("Problem","bug") AND created >="' + startCreatedDate +'" AND created <="' + endCreatedDate + '" ORDER BY created'
    //                     var jqlObj = {jqlStr: jqlInflowStr, month: month, year: yearCounter,type:"inflow"};
    //                     inputJQL.push(jqlObj);
    //
    //                     var jqlOutflowStr = 'project IN('+project+') AND issuetype in ("Problem","bug") AND status changed to "Done" before "'+endCreatedDate+'" after "'+startCreatedDate + '"ORDER BY updatedDate';
    //                     var jqlObj = {jqlStr: jqlOutflowStr, month: month, year: yearCounter,type:"outflow",start:startCreatedDate,end:endCreatedDate};
    //                     inputJQL.push(jqlObj);
    //
    //                     month++;
    //                     if (month == 13) {
    //                         month = 1;
    //                     }
    //                     else {
    //                         //month=i+1;
    //                     }
    //                 }
    //             }
    //
    //            else if(type==TYPE.DAILY) {
    //
    //                     var start = startInputDate;
    //                     var end = endInputDate;
    //                     while(start <= end){
    //                         var day = start.getDate();
    //                         var startCreatedDate = start.getFullYear() + "-" + (start.getMonth()+1) + "-" + start.getDate();
    //
    //                         var endCreatedDate = start.getFullYear() + "-" + (start.getMonth()+1) + "-" + (start.getDate()+1);
    //                         var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was not "Done"  on "' + endCreatedDate + '" AND created <"' + endCreatedDate + '" ORDER BY updatedDate'
    //                         var jqlObj = {jqlStr: jqlStr, month: month,day:day, year: yearCounter,type:"backlog"};
    //                         inputJQL.push(jqlObj);
    //
    //                         var jqlInflowStr = 'project IN (' + project + ') AND issuetype in ("Problem","bug") AND created >="' + startCreatedDate +'" AND created <="' + endCreatedDate + '" ORDER BY created'
    //                         var jqlObj = {jqlStr: jqlInflowStr, month: month,day:day, year: yearCounter,type:"inflow"};
    //                         inputJQL.push(jqlObj);
    //
    //                         var jqlOutflowStr = 'project IN('+project+') AND issuetype in ("Problem","bug") AND status changed to "Done" before "'+endCreatedDate+'" after "'+startCreatedDate + '"ORDER BY updatedDate';
    //                         var jqlObj = {jqlStr: jqlOutflowStr, month: month,day:day, year: yearCounter,type:"outflow",start:startCreatedDate,end:endCreatedDate};
    //                         inputJQL.push(jqlObj);
    //
    //                         var newDate = start.setDate(start.getDate() + 1);
    //                         start = new Date(newDate);
    //                     }
    //                 }
    //
    //
    //
    //             else if(type==TYPE.WEEKLY) {
    //                 var weekNumberStart = startInputDate.getWeek();
    //
    //                 var startDateForYear = new Date(month+"/1/"+yearCounter);
    //                 var endDateForYear =  new Date("12/31/"+yearCounter);
    //                 if(endDateForYear>=endInputDate) {
    //                     endDateForYear = endInputDate;
    //                 }
    //                     var numberOfWeeks = weeks_between(startDateForYear, endDateForYear);
    //
    //                     for (var week = weekNumberStart; week < numberOfWeeks+weekNumberStart; week++) {
    //                         var actualWeek = (week%52)+1;
    //
    //                         var weekDate = getDateRangeOfWeek(actualWeek);
    //                         var weekStartDate = weekDate.weekStartDate;
    //                         var weekEndDate = weekDate.weekEndDate;
    //                         var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was not "Done"  on "' + weekEndDate + '" AND created <"' + weekEndDate + '" ORDER BY updatedDate'
    //                         var jqlObj = {jqlStr: jqlStr, month: actualWeek, year: yearCounter,type:"backlog"};
    //                         inputJQL.push(jqlObj);
    //
    //                         var jqlInflowStr = 'project IN (' + project + ') AND issuetype in ("Problem","bug") AND created >="' + weekStartDate +'" AND created <="' + weekEndDate + '" ORDER BY created'
    //                         var jqlObj = {jqlStr: jqlInflowStr, month: actualWeek, year: yearCounter,type:"inflow"};
    //                         inputJQL.push(jqlObj);
    //
    //                         var jqlOutflowStr = 'project IN('+project+') AND issuetype in ("Problem","bug") AND status changed to "Done" before "'+weekEndDate+'" after "'+weekEndDate + '" ORDER BY updatedDate';
    //                         var jqlObj = {jqlStr: jqlOutflowStr, month: actualWeek, year: yearCounter,type:"outflow",start:weekStartDate,end:endCreatedDate};
    //                         inputJQL.push(jqlObj);
    //
    //
    //                     }
    //
    //             }
    //
    //             else if(type==TYPE.YEARLY) {
    //                 var lastDay = lastday(yearCounter, month)
    //                 var endCreatedDate = yearCounter + "-12" + "-" + lastDay;
    //                 var firstDay = 1;
    //                 if(startInputDate.getFullYear()==yearCounter){
    //                     firstDay = startInputDate.getDate();
    //                 }
    //                 var startCreatedDate = yearCounter + "-1" + "-"+firstDay;
    //
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was not "Done"  on "' + endCreatedDate + '" AND created <"' + endCreatedDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: month, year: yearCounter,type:"backlog"};
    //                 inputJQL.push(jqlObj);
    //
    //                 var jqlInflowStr = 'project IN (' + project + ') AND issuetype in ("Problem","bug") AND created >="' + startCreatedDate +'" AND created <="' + endCreatedDate + '" ORDER BY created'
    //                 var jqlObj = {jqlStr: jqlInflowStr, month: month, year: yearCounter,type:"inflow"};
    //                 inputJQL.push(jqlObj);
    //
    //                 var jqlOutflowStr = 'project IN('+project+') AND issuetype in ("Problem","bug") AND status changed to "Done" before "'+endCreatedDate+'" after "'+startCreatedDate + '"ORDER BY updatedDate';
    //                 var jqlObj = {jqlStr: jqlOutflowStr, month: month, year: yearCounter,type:"outflow",start:startCreatedDate,end:endCreatedDate};
    //                 inputJQL.push(jqlObj);
    //             }
    //             yearCounter++;
    //         }
    //
    //     if(inputJQL.length==0){
    //         res.status(401).send("some error in input");
    //         return;
    //     }
    //     inputJQL.map((element)=>{
    //
    //         getBacklogIssuesFromJIRA(req,0,jiraObj,element,type,res);
    //     })
    //
    //
    //     req.session.JQLCount=inputJQL.length;
    //
    //    // var jqlInflowStr = 'project IN (' + project + ') AND issuetype in ("Problem","bug") AND created >="' + req.query.startDate +'" AND created <="' + req.query.endDate + '" ORDER BY created'
    //
    //     // getInflowIssuesFromJIRA(req,jiraObj,jqlInflowStr,
    //     //     startYear,
    //     //     endYear,
    //     //     startInputDate.getMonth()+1,
    //     //     type,
    //     //     project,
    //     //     res);
    //
    //     // var jqlOutflowStr = 'project IN('+project+') AND issuetype in ("Problem","bug") AND status changed to "Done" before "'+req.query.endDate+'" after "'+req.query.startDate + '"ORDER BY updatedDate'
    //     //
    //     // console.log("jqlOutflowStr",jqlOutflowStr);
    //     //
    //     // getOutflowIssuesFromJIRA(req,jiraObj,jqlOutflowStr,
    //     //     startYear,
    //     //     endYear,
    //     //     startInputDate.getMonth()+1,
    //     //     type,
    //     //     project,
    //     //     res);
    //
    //
    //
    // });

    // app.get("/trendsBacklog", function (req, res) {
    //     let date = new Date();
    //     var startTrendDate = (date.getFullYear()-1) + "-" + (date.getMonth()+1) + "-" + date.getDate();
    //     var endTrendDate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
    //     var fs = require('fs');
    //     var startTrendDateDayNext = (date.getFullYear()-1) + "-" + (date.getMonth()+1) + "-" + (date.getDate()+1);
    //     var endTrendDateDayNext = date.getFullYear() + "-" + (date.getMonth()+1) + "-" +(date.getDate()+1);
    //     if(req.query.project == "DevOps,CDX,DOC,LB,MON,UDNP,CIS,CS,RENG,AN" &&
    //         req.query.trendsType=="Monthly" &&
    //         (req.query.startDate == startTrendDate && req.query.endDate == endTrendDate ||
    //             req.query.startDate == startTrendDateDayNext && req.query.endDate == endTrendDateDayNext
    //
    //         )
    //     ){
    //         req.session.sent = false;
    //         if (fs.existsSync("chart2data.json")) {
    //             var chart2content = fs.readFileSync("chart2data.json", 'utf8');
    //             var jsonChart2 = JSON.parse(chart2content);
    //             if(req.session.sent==false) {
    //                 res.status(200).send(jsonChart2);
    //             }
    //             req.session.sent=true;
    //         }
    //     }
    //
    //     if(req.session.result){
    //         // req.session.result.backlog.splice(0,req.session.result.backlog.length);
    //         // req.session.result.triage.splice(0,req.session.result.triage.length);
    //         // req.session.result.intest.splice(0,req.session.result.intest.length);
    //         // req.session.result.dev.splice(0,req.session.result.dev.length);
    //
    //     }
    //     req.session.result={backlog:[],triage:[],intest:[],dev:[]};
    //     req.query.startDate= req.query.startDate.replace(/(^|-)0+/g, "$1")
    //     req.query.endDate= req.query.endDate.replace(/(^|-)0+/g, "$1")
    //
    //     var startInputDate = new Date(req.query.startDate);
    //     var endInputDate = new Date(req.query.endDate);
    //     req.session.monthCount =startInputDate.MonthsBetween(endInputDate)+1;
    //     var startYear = startInputDate.getFullYear();
    //     var endYear = endInputDate.getFullYear()
    //     var project = req.query.project;
    //     var trendsType = req.query.trendsType;
    //     var type=1;
    //     if(trendsType=="Monthly"){
    //         type=1;
    //     } else if(trendsType=="Quarterly"){
    //         type=2;
    //     } else if(trendsType=="Yearly"){
    //         type=3;
    //     } else if(trendsType=="Weekly"){
    //         type=4;
    //     } else if(trendsType=="Daily"){
    //         type=5;
    //     }
    //
    //
    //
    //
    //     var projectArray;
    //     if(project.includes(",")){
    //         projectArray = project.split(",");
    //         project = "'" + projectArray.join("','") + "'"
    //     }
    //
    //     var inputJQL = [];
    //     var month=startInputDate.getMonth()+1;
    //     var yearCounter = startYear;
    //
    //     if (type==TYPE.QUARTERLY){
    //         var startMonthDate = new Date(req.query.startDate);
    //         var endMonthDate = new Date(req.query.endDate);
    //         var startQuarter=1;
    //         var startQuarterMonth=1;
    //         var endQuarterMonth=1;
    //
    //         while(startMonthDate <= endMonthDate) {
    //             var month1 = startMonthDate.getMonth() + 1;
    //             var year1 = startMonthDate.getFullYear();
    //
    //
    //             if(month1==1 || month1==2 || month1==3){
    //                 startQuarter=1;
    //                 startQuarterMonth=1;
    //                 endQuarterMonth=3;
    //             }
    //             else if(month1==4 || month1==5 || month1==6){
    //                 startQuarter=2;
    //                 startQuarterMonth=4;
    //                 endQuarterMonth=6;
    //             }
    //             else if(month1==7 || month1==8 || month1==9){
    //                 startQuarter=3;
    //                 startQuarterMonth=7;
    //                 endQuarterMonth=9;
    //             }
    //             else if(month1==10 || month1==11 || month1==12){
    //                 startQuarter=4;
    //                 startQuarterMonth=10;
    //                 endQuarterMonth=12;
    //             }
    //             var lastDay = lastday(startMonthDate.getFullYear(), startMonthDate.getMonth())
    //             var endCreatedDate = startMonthDate.getFullYear() + "-" + (startMonthDate.getMonth()+1) + "-" + lastDay;
    //             var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was not "Done"  on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //             var jqlObj = {jqlStr: jqlStr, month: startQuarter, year: year1,backlogType:"overall"};
    //             inputJQL.push(jqlObj);
    //
    //             var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was "In Triage"  on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //             var jqlObj = {jqlStr: jqlStr, month: startQuarter, year: year1,backlogType:"intriage"};
    //             inputJQL.push(jqlObj);
    //
    //             var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was in ("Ready for Test","In test") on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //             var jqlObj = {jqlStr: jqlStr, month: startQuarter, year: year1,backlogType:"intest"};
    //             inputJQL.push(jqlObj);
    //
    //             var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was in ("TODO","In Progress","In Review")  on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //             var jqlObj = {jqlStr: jqlStr, month: startQuarter, year: year1,backlogType:"dev"};
    //             inputJQL.push(jqlObj);
    //
    //             var newDate = startMonthDate.setMonth(startMonthDate.getMonth() + 3);
    //             startMonthDate = new Date(newDate);
    //         }
    //     }
    //
    //     while(yearCounter<=endYear) {
    //         var startDateForYear = new Date(month+"/1/"+yearCounter);
    //         var endDateForYear =  new Date("12/31/"+yearCounter);
    //         if(endDateForYear>=endInputDate) {
    //             endDateForYear = endInputDate;
    //         }
    //         var numberOfMonthsForYears = startDateForYear.MonthsBetween(endDateForYear)+1;
    //
    //         if(type==TYPE.MONTHLY) {
    //             var startMonth = month;
    //             for (var i = month; i < numberOfMonthsForYears+startMonth; i++) {
    //
    //                 var lastDay = lastday(yearCounter, month - 1)
    //                 var endCreatedDate = yearCounter + "-" + month + "-" + lastDay;
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was not "Done"  on "' + endCreatedDate + '" AND created <"' + endCreatedDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: month, year: yearCounter,backlogType:"overall"};
    //                 inputJQL.push(jqlObj);
    //
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was "In Triage"  on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: month, year: yearCounter,backlogType:"intriage"};
    //                 inputJQL.push(jqlObj);
    //
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was in ("Ready for Test","In test") on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: month, year: yearCounter,backlogType:"intest"};
    //                 inputJQL.push(jqlObj);
    //
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was in ("TODO","In Progress","In Review")  on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: month, year: yearCounter,backlogType:"dev"};
    //                 inputJQL.push(jqlObj);
    //
    //                 month++;
    //                 if (month == 13) {
    //                     month = 1;
    //                 }
    //                 else {
    //                     //month=i+1;
    //                 }
    //             }
    //         }
    //
    //         else if(type==TYPE.DAILY) {
    //
    //             var start = startInputDate;
    //             var end = endInputDate;
    //             while(start <= end){
    //                 var day = start.getDate();
    //                 var newDate = start.setDate(start.getDate() + 1);
    //                 start = new Date(newDate);
    //                 var endCreatedDate = yearCounter + "-" + month + "-" + day;
    //
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was not "Done"  on "' + endCreatedDate + '" AND created <"' + endCreatedDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: month,day:day, year: yearCounter,backlogType:"overall"};
    //                 inputJQL.push(jqlObj);
    //
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was "In Triage"  on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: month,day:day, year: yearCounter,backlogType:"intriage"};
    //                 inputJQL.push(jqlObj);
    //
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was in ("Ready for Test","In test") on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: month,day:day, year: yearCounter,backlogType:"intest"};
    //                 inputJQL.push(jqlObj);
    //
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was in ("TODO","In Progress","In Review")  on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: month,day:day, year: yearCounter,backlogType:"dev"};
    //                 inputJQL.push(jqlObj);
    //             }
    //         }
    //
    //
    //
    //         else if(type==TYPE.WEEKLY) {
    //             var weekNumberStart = startInputDate.getWeek();
    //
    //             var startDateForYear = new Date(month+"/1/"+yearCounter);
    //             var endDateForYear =  new Date("12/31/"+yearCounter);
    //             if(endDateForYear>=endInputDate) {
    //                 endDateForYear = endInputDate;
    //             }
    //             var numberOfWeeks = weeks_between(startDateForYear, endDateForYear);
    //
    //             for (var week = weekNumberStart; week <= numberOfWeeks+weekNumberStart; week++) {
    //                 var actualWeek = (week%52)+1;
    //
    //                 var weekDate = getDateRangeOfWeek(actualWeek);
    //                 var weekEndDate = weekDate.weekEndDate;
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was not "Done"  on "' + weekEndDate + '" AND created <"' + weekEndDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: actualWeek, year: yearCounter};
    //                 inputJQL.push(jqlObj);
    //
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was not "Done"  on "' + weekEndDate + '" AND created <"' + weekEndDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: actualWeek, year: yearCounter,backlogType:"overall"};
    //                 inputJQL.push(jqlObj);
    //
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was "In Triage"  on "' + weekEndDate + '" AND created <="' + weekEndDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: actualWeek, year: yearCounter,backlogType:"intriage"};
    //                 inputJQL.push(jqlObj);
    //
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was in ("Ready for Test","In test") on "' + weekEndDate + '" AND created <="' + weekEndDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: actualWeek, year: yearCounter,backlogType:"intest"};
    //                 inputJQL.push(jqlObj);
    //
    //                 var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was in ("TODO","In Progress","In Review")  on "' + weekEndDate + '" AND created <="' + weekEndDate + '" ORDER BY updatedDate'
    //                 var jqlObj = {jqlStr: jqlStr, month: actualWeek, year: yearCounter,backlogType:"dev"};
    //                 inputJQL.push(jqlObj);
    //
    //
    //             }
    //
    //         }
    //
    //         else if(type==TYPE.YEARLY) {
    //             var lastDay = lastday(yearCounter, month - 1)
    //             var endCreatedDate = yearCounter + "-12" + "-" + lastDay;
    //
    //             var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was not "Done"  on "' + weekEndDate + '" AND created <"' + weekEndDate + '" ORDER BY updatedDate'
    //             var jqlObj = {jqlStr: jqlStr, month: month, year: yearCounter};
    //             inputJQL.push(jqlObj);
    //
    //             var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was not "Done"  on "' + endCreatedDate + '" AND created <"' + endCreatedDate + '" ORDER BY updatedDate'
    //             var jqlObj = {jqlStr: jqlStr, month: month, year: yearCounter,backlogType:"overall"};
    //             inputJQL.push(jqlObj);
    //
    //             var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was "In Triage"  on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //             var jqlObj = {jqlStr: jqlStr, month: month, year: yearCounter,backlogType:"intriage"};
    //             inputJQL.push(jqlObj);
    //
    //             var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was in ("Ready for Test","In test") on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //             var jqlObj = {jqlStr: jqlStr, month: month, year: yearCounter,backlogType:"intest"};
    //             inputJQL.push(jqlObj);
    //
    //             var jqlStr = 'project IN(' + project + ') AND issuetype in ("Problem","bug") AND status was in ("TODO","In Progress","In Review")  on "' + endCreatedDate + '" AND created <="' + endCreatedDate + '" ORDER BY updatedDate'
    //             var jqlObj = {jqlStr: jqlStr, month: month, year: yearCounter,backlogType:"dev"};
    //             inputJQL.push(jqlObj);
    //         }
    //         yearCounter++;
    //     }
    //
    //     if(inputJQL.length==0){
    //         if(req.session.sent==false){
    //             res.status(401).send("some error in input");
    //         }
    //
    //         return;
    //     }
    //     inputJQL.map((element)=>{
    //         getTotalBacklogIssuesFromJIRA(req,0,jiraObj,element,type,res);
    //     })
    //
    //     //console.log("inputJQL.length",inputJQL.length);
    //     req.session.JQLCount=inputJQL.length;
    //
    //
    // });


    function getTotalBacklogIssuesFromJIRA(req,startAt,jiraObj,jqlObj,type,res) {
        var maxResults =10000;
        //var jqlObj=inputJQL[0];
        jiraObj.search.search({
            jql: jqlObj.jqlStr,
            //expand:['changelog'],
            //fields:['status','updated','created'],
            startAt:startAt,
            maxResults:maxResults

        }, function(error, response) {


            if(response==null){

                if(type==TYPE.MONTHLY){
                    req.session.result.backlog.push({year:jqlObj.year,month:jqlObj.month,statusCount:0,
                        jql:jqlObj.jqlStr
                    })
                }
                else if(type==TYPE.QUARTERLY){
                    req.session.result.backlog.push({year:jqlObj.year,quarter:jqlObj.month,statusCount:0,
                        jql:jqlObj.jqlStr
                    })
                }
                else if(type==TYPE.YEARLY){
                    req.session.result.backlog.push({year:jqlObj.year,statusCount:0,
                        jql:jqlObj.jqlStr
                    })
                }
                else if(type==TYPE.WEEKLY){
                    req.session.result.backlog.push({year:jqlObj.year,week:jqlObj.month,statusCount:0,
                        jql:jqlObj.jqlStr
                    })
                }
                else if(type==TYPE.DAILY){

                    req.session.result.backlog.push({year:jqlObj.year,month:jqlObj.month,day:jqlObj.day,statusCount:0,
                        jql:jqlObj.jqlStr
                    });
                }

                if( req.session.result.backlog.length==req.session.JQLCount){
                    if(req.session.sent==false) {
                        res.status(200).send(req.session.result);
                    }
                }
            }
            else{

                var issuesArray = response.issues;
                if(type==TYPE.MONTHLY){
                    req.session.result.backlog.push({year:jqlObj.year,month:jqlObj.month,statusCount:issuesArray.length,
                        backlogType:jqlObj.backlogType,
                        jql:jqlObj.jqlStr
                    });
                }
                else if(type==TYPE.QUARTERLY){
                    req.session.result.backlog.push({year:jqlObj.year,quarter:jqlObj.month,statusCount:issuesArray.length,
                        backlogType:jqlObj.backlogType,
                        jql:jqlObj.jqlStr
                    });
                }
                else if(type==TYPE.YEARLY){
                    req.session.result.backlog.push({year:jqlObj.year,statusCount:issuesArray.length,
                        backlogType:jqlObj.backlogType,
                        jql:jqlObj.jqlStr
                    });
                }
                else if(type==TYPE.WEEKLY){

                    req.session.result.backlog.push({year:jqlObj.year,week:jqlObj.month,statusCount:issuesArray.length,
                        backlogType:jqlObj.backlogType,
                        jql:jqlObj.jqlStr
                    });
                }
                else if(type==TYPE.DAILY){

                    req.session.result.backlog.push({year:jqlObj.year,month:jqlObj.month,day:jqlObj.day,statusCount:issuesArray.length,
                        backlogType:jqlObj.backlogType,
                        jql:jqlObj.jqlStr
                    });
                }


                if( req.session.result.backlog.length==req.session.JQLCount){

                    var triageBacklog = req.session.result.backlog.filter((element,index)=>{
                        return element.backlogType == "intriage"

                    })
                    req.session.result.triage = triageBacklog;

                    var intestBacklog = req.session.result.backlog.filter((element,index)=>{
                        return element.backlogType == "intest"

                    })
                    req.session.result.intest = intestBacklog;

                    var devBacklog = req.session.result.backlog.filter((element,index)=>{
                        return element.backlogType == "dev"

                    })
                    req.session.result.dev = devBacklog;

                    var devBacklog = req.session.result.backlog.filter((element,index)=>{
                        return element.backlogType == "overall"

                    })
                    req.session.result.backlog = devBacklog;

                    if(type==TYPE.MONTHLY){
                        req.session.result.backlog.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"];
                        });

                        req.session.result.triage.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"];
                        });

                        req.session.result.intest.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"];
                        });

                        req.session.result.dev.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"];
                        });
                    }
                    else if(type==TYPE.QUARTERLY){
                        req.session.result.backlog.sort(function(a, b) {
                            return a["year"] - b["year"] || a["quarter"] - b["quarter"];
                        });

                        req.session.result.triage.sort(function(a, b) {
                            return a["year"] - b["year"] || a["quarter"] - b["quarter"];
                        });

                        req.session.result.intest.sort(function(a, b) {
                            return a["year"] - b["year"] || a["quarter"] - b["quarter"];
                        });

                        req.session.result.dev.sort(function(a, b) {
                            return a["year"] - b["year"] || a["quarter"] - b["quarter"];
                        });
                    }
                    else if(type==TYPE.YEARLY){
                        req.session.result.backlog.sort(function(a, b) {
                            return a["year"] - b["year"];
                        });

                        req.session.result.triage.sort(function(a, b) {
                            return a["year"] - b["year"];
                        });

                        req.session.result.intest.sort(function(a, b) {
                            return a["year"] - b["year"];
                        });

                        req.session.result.dev.sort(function(a, b) {
                            return a["year"] - b["year"];
                        });
                    }
                    else if(type==TYPE.WEEKLY){

                        req.session.result.backlog.sort(function(a, b) {
                            return a["year"] - b["year"] || a["week"] - b["week"];
                        });

                        req.session.result.triage.sort(function(a, b) {
                            return a["year"] - b["year"] || a["week"] - b["week"];
                        });

                        req.session.result.intest.sort(function(a, b) {
                            return a["year"] - b["year"] || a["week"] - b["week"];
                        });

                        req.session.result.dev.sort(function(a, b) {
                            return a["year"] - b["year"] || a["week"] - b["week"];
                        });
                    }
                    else if(type==TYPE.DAILY){
                        req.session.result.backlog.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"] || a["day"] - b["day"];
                        });

                        req.session.result.triage.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"] || a["day"] - b["day"];
                        });

                        req.session.result.intest.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"] || a["day"] - b["day"];
                        });

                        req.session.result.dev.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"] || a["day"] - b["day"];
                        });
                    }

                    if(req.session.sent==false){
                        res.status(200).send(req.session.result);
                    }


                    let date = new Date();
                    var startTrendDate = (date.getFullYear()-1) + "-" + (date.getMonth()+1) + "-" + date.getDate();
                    var endTrendDate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();

                    var startTrendDateDayNext = (date.getFullYear()-1) + "-" + (date.getMonth()+1) + "-" + (date.getDate()+1);
                    var endTrendDateDayNext = date.getFullYear() + "-" + (date.getMonth()+1) + "-" +(date.getDate()+1);
                    if(req.query.project == "DevOps,CDX,DOC,LB,MON,UDNP,CIS,CS,RENG,AN" &&
                        req.query.trendsType=="Monthly" &&
                        (req.query.startDate == startTrendDate && req.query.endDate == endTrendDate ||
                            req.query.startDate == startTrendDateDayNext && req.query.endDate == endTrendDateDayNext

                        )
                    ){
                        var fs = require('fs');
                        fs.writeFile('chart2data.json', JSON.stringify(req.session.result), function (err) {
                            if (err) return console.log(err);

                        });
                    }
                }


            }


        });


    }



    function getBacklogIssuesFromJIRA(req,startAt,jiraObj,jqlObj,type,res) {
        var maxResults =10000;
        //var jqlObj=inputJQL[0];
        var expand = jqlObj.type=='outflow'?'changelog':'';

        jiraObj.search.search({
            jql: jqlObj.jqlStr,
            expand:[expand],
            fields:['status','updated','created'],
            startAt:startAt,
            maxResults:maxResults

        }, function(error, response) {


            if(response==null){

                if(type==TYPE.MONTHLY){
                    req.session.result.backlog.push({year:jqlObj.year,month:jqlObj.month,statusCount:0,
                        jql:jqlObj.jqlStr
                    })
                }
                else if(type==TYPE.QUARTERLY){
                    req.session.result.backlog.push({year:jqlObj.year,quarter:jqlObj.month,statusCount:0,
                        jql:jqlObj.jqlStr
                    })
                }
                else if(type==TYPE.YEARLY){
                    req.session.result.backlog.push({year:jqlObj.year,statusCount:0,
                        jql:jqlObj.jqlStr
                    })
                }
                else if(type==TYPE.WEEKLY){
                    req.session.result.backlog.push({year:jqlObj.year,week:jqlObj.month,statusCount:0,
                        jql:jqlObj.jqlStr
                    })
                }
                else if(type==TYPE.DAILY){

                    req.session.result.backlog.push({year:jqlObj.year,month:jqlObj.month,day:jqlObj.day,statusCount:0,
                        jql:jqlObj.jqlStr
                    });
                }



                if( req.session.result.backlog.length==req.session.JQLCount){

                    if(req.session.sent==false) {
                        res.status(200).send(req.session.result);
                    }


                }
            }
            else{

                var issuesArray = response.issues;
                counter = issuesArray.length;
                if(jqlObj.type=="outflow"){

                    var counter=0;
                    for(var i=0;i<issuesArray.length;i++) {
                        var element = issuesArray[i];
                        var statusName = element.fields.status.name;
                        var changelog = element.changelog;
                        var histories = changelog.histories;
                        var flag = false;
                        if (statusName == "Done") {
                            histories.reverse();
                            for (var j = 0; j < histories.length; j++) {
                                var historyElement = histories[j];
                                var created = historyElement.created;
                                created = created.split('T')[0];
                                created = new Date(created);
                                var items = historyElement.items;
                                items.reverse();
                                for (var k = 0; k < items.length; k++) {
                                    var start = new Date (jqlObj.start);
                                    var end = new Date(jqlObj.end);
                                    var itemElement = items[k];

                                    if (itemElement.toString == "Done" && created>=start && created<=end) {
                                        counter++;
                                        flag=true;
                                        break;
                                    }
                                }
                                if(flag==true)
                                {
                                    break;
                                }

                            }
                        }

                    }

                }


                if(type==TYPE.MONTHLY){
                    req.session.result.backlog.push({year:jqlObj.year,month:jqlObj.month,statusCount:counter,
                        jql:jqlObj.jqlStr,type:jqlObj.type
                    });
                }
                else if(type==TYPE.QUARTERLY){
                        req.session.result.backlog.push({year:jqlObj.year,quarter:jqlObj.month,statusCount:counter,
                            jql:jqlObj.jqlStr,type:jqlObj.type
                        });
                    }
                else if(type==TYPE.YEARLY){
                    req.session.result.backlog.push({year:jqlObj.year,statusCount:counter,
                        jql:jqlObj.jqlStr,type:jqlObj.type
                    });
                }
                else if(type==TYPE.WEEKLY){

                    req.session.result.backlog.push({year:jqlObj.year,week:jqlObj.month,statusCount:counter,
                        jql:jqlObj.jqlStr,type:jqlObj.type
                    });
                }
                else if(type==TYPE.DAILY){

                    req.session.result.backlog.push({year:jqlObj.year,month:jqlObj.month,day:jqlObj.day,statusCount:counter,
                        jql:jqlObj.jqlStr,type:jqlObj.type
                    });
                }


                if(req.session.result.backlog.length==req.session.JQLCount){

                }
                if( req.session.result.backlog.length==req.session.JQLCount){


                    var inflow = req.session.result.backlog.filter((element,index)=>{
                        return element.type == "inflow"

                    })
                    req.session.result.inflow = inflow;

                    var outflow = req.session.result.backlog.filter((element,index)=>{
                        return element.type == "outflow"

                    })

                    req.session.result.outflow = outflow;

                    var backlog = req.session.result.backlog.filter((element,index)=>{
                        return element.type == "backlog"

                    })
                    req.session.result.backlog = backlog;


                    if(type==TYPE.MONTHLY){
                        req.session.result.backlog.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"];
                        });

                        req.session.result.inflow.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"];
                        });

                        req.session.result.outflow.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"];
                        });
                    }
                    else if(type==TYPE.QUARTERLY){
                        req.session.result.backlog.sort(function(a, b) {
                            return a["year"] - b["year"] || a["quarter"] - b["quarter"];
                        });
                        req.session.result.inflow.sort(function(a, b) {
                            return a["year"] - b["year"] || a["quarter"] - b["quarter"];
                        });
                        req.session.result.outflow.sort(function(a, b) {
                            return a["year"] - b["year"] || a["quarter"] - b["quarter"];
                        });
                    }
                    else if(type==TYPE.YEARLY){
                        req.session.result.backlog.sort(function(a, b) {
                            return a["year"] - b["year"];
                        });

                        req.session.result.inflow.sort(function(a, b) {
                            return a["year"] - b["year"];
                        });

                        req.session.result.outflow.sort(function(a, b) {
                            return a["year"] - b["year"];
                        });
                    }
                    else if(type==TYPE.WEEKLY){

                        req.session.result.backlog.sort(function(a, b) {
                            return a["year"] - b["year"] || a["week"] - b["week"];
                        });

                        req.session.result.inflow.sort(function(a, b) {
                            return a["year"] - b["year"] || a["week"] - b["week"];
                        });

                        req.session.result.outflow.sort(function(a, b) {
                            return a["year"] - b["year"] || a["week"] - b["week"];
                        });
                    }
                    else if(type==TYPE.DAILY){
                        req.session.result.backlog.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"] || a["day"] - b["day"];
                        });

                        req.session.result.inflow.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"] || a["day"] - b["day"];
                        });

                        req.session.result.outflow.sort(function(a, b) {
                            return a["year"] - b["year"] || a["month"] - b["month"] || a["day"] - b["day"];
                        });
                    }

                    if(req.session.sent==false){
                        res.status(200).send(req.session.result);
                    }

                    let date = new Date();
                    var startTrendDate = (date.getFullYear()-1) + "-" + (date.getMonth()+1) + "-" + date.getDate();
                    var endTrendDate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
                    var fs = require('fs');

                    var startTrendDateDayNext = (date.getFullYear()-1) + "-" + (date.getMonth()+1) + "-" + (date.getDate()+1);
                    var endTrendDateDayNext = date.getFullYear() + "-" + (date.getMonth()+1) + "-" +(date.getDate()+1);
                    if(req.query.project == "DevOps,CDX,DOC,LB,MON,UDNP,CIS,CS,RENG,AN" &&
                        req.query.trendsType=="Monthly" &&
                        (req.query.startDate == startTrendDate && req.query.endDate == endTrendDate ||
                            req.query.startDate == startTrendDateDayNext && req.query.endDate == endTrendDateDayNext

                        )
                    ){
                        var fs = require('fs');
                        fs.writeFile('chart1data.json', JSON.stringify(req.session.result), function (err) {
                            if (err) return console.log(err);

                        });
                    }


                }


            }


        });


    }




    app.get("/issuesMetrics", function (req, res) {

        res.status(200).send("data");
        var dateStr = ''
        getIssuesFromJIRA(0,jiraObj,dateStr);



    });

    function getIssuesFromJIRA(startAt,jiraObj,dateStr) {
        var maxResults =50;


        var jql1='project IN("CDX","AN","DO","RENG","DOC","LB","MON","UDNP","CIS","CS") AND issuetype in ("Problem","bug") '+dateStr;
        console.log(startAt);
        jiraObj.search.search({
            jql: jql1,
            expand:['changelog'],
            fields:['status','updated','created'],
            startAt:startAt,
            maxResults:maxResults

        }, function(error, response) {
            console.log("startAt",startAt,"error",error);


         if(response==null){

                //console.log("response",response);
                //var startAtMoveTo =startAt+maxResults;
                //getIssuesFromJIRA(startAtMoveTo,jiraObj);

            }
           else if( response.issues.length==0){

             if(dateStr==''){
                 var issues_sync_copy_procedureSQL =  "CALL issues_sync_copy_procedure()";
                 db.run(issues_sync_copy_procedureSQL, function (err, rows) {
                     console.log("done sync");
                     if (err) {

                     }
                 });
             }
                console.log("response",response);
                return;
            }

            else{
                var issuesArray = response.issues;
                issuesArray.filter((element,index,issueArr)=>{
                    var historiesArray = element.changelog.histories

                    historiesArray.filter((historyElement,index,historiesArr)=>{
                        delete historyElement.author;
                        var itemsArray = historyElement.items
                        itemsArray.filter((itemElement,index,itemArr)=>{
                           // delete itemElement.field;
                          //  delete itemElement.fieldtype;
                            //delete itemElement.from;
                            //delete itemElement.to;
                            var fromString = itemElement.fromString;

                            if (typeof fromString === 'string') {
                                // this is a string
                                fromString = fromString.length > 30 ? "" : fromString;
                            }
                            else{
                                fromString="";
                            }
                            itemElement.fromString = fromString;

                            var toString = itemElement.toString;

                            if (typeof toString === 'string') {


                                toString = toString.length > 30 ? "" : toString;

                            }
                            else{
                                toString ="";
                            }
                            itemElement.toString = toString;
                            itemArr[index] = itemElement;

                        })
                    })

                })

                var bodyStr = JSON.stringify(issuesArray);
                //console.log(bodyStr);

                //bodyStr= bodyStr.replace(/'/g, '')


                var bodyStrAfterReplace = bodyStr.replace(/(\r\n|\n|\r)/gm,"").replace(/[`~!@#$%^&*()_|+=?;'<>]/gi, '');

                var issues_procedureSQL =  "CALL issues_procedure(?)";


             if(dateStr==''){
                 issues_procedureSQL = "CALL issues_sync_procedure(?)";
             }
                db.run(issues_procedureSQL,[bodyStrAfterReplace], function (err, rows) {
                    if(err){
                        var fs =require('fs');
                        fs.writeFile('test1.txt',err, function (err) {
                            if (err) return console.log(err);

                        });
                        fs.writeFile('test.txt', bodyStrAfterReplace, function (err) {
                            if (err) return console.log(err);

                        });

                        //var startAtMoveTo =startAt+maxResults;
                        //getIssuesFromJIRA(startAtMoveTo,jiraObj,dateStr);

                        console.log('Error in database');
                    }
                    else{
                        var fs =require('fs');
                        fs.writeFile('test.txt', bodyStrAfterReplace, function (err) {
                            if (err) return console.log(err);

                        });

                        var startAtMoveTo =startAt+maxResults;
                        getIssuesFromJIRA(startAtMoveTo,jiraObj,dateStr);
                    }

                })
            }


        });


    }






};


