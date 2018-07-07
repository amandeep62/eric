const request = require('request');
const config = require('./config/config');
const Capacity = require('./JIRABackendOperation/Capacity')
/**
 * Constructor
 * @param _app
 * @constructor
 */
function JiraAPI (_app) {
    this.app = _app;

    let _auth = "Basic " + new Buffer(config.data.jira.username + ":" + config.data.jira.password).toString("base64");

    this.getAuth = function() {
        return _auth;
    }

}


function Items () {
    this.getAllItems = function() {
        return _allItems;
    }

    this.getCallNum = function() {
        return _callNum;
    }

    this.increaseCallNum = function() {
        _callNum++;
    }

    this.concatItems = function(items) {
        _allItems = _allItems.concat(items);
    }

    this.initCalls = function() {
        _allItems = [];
        _callNum = 0;
    }

    let _allItems = [];
    let _callNum = 0;
}


/**
 * Initialize JIRA module
 */
JiraAPI.prototype.init = function() {
    var app = this.app;
    var self = this;

    app.get("/get", function (req, res) {
        var username = "ramesh.reddy.daggolu@ericsson.com";
        var password = "ramesh1976";
        var url = "https://vidscale.atlassian.net/rest/gadget/1.0/statistics?filterId=21204&statType=statuses&_=1500335680701";

        console.log("url=" + url);

        var strText = "";
        console.log(url)
        request.get({
            url: url,
            headers: {
                "Authorization": self.getAuth()
            }
        }, function (error, response, body) {
            res.send(body);
        });

    });


    /**
     * Straight JIRA query. Needed to write this one because /query has some bugs.
     * Take as url parameters:
     * - jql: the JQL query string
     * - fields: the set of fields name (separated by comma) to filter on the query
     * - maxResults: the maximum number of records to return from the query.
     *               By default, it will be set to 1000.
     */

    app.get("/queryjira", function(req, res) {

        let jqlParam = req.query['jql'];                //jql parameters
        let jqlFields = req.query['fields'];            //fields to filter in the JQL query
        let jqlMaxResults = req.query['maxResults'];    //max results to return from the JQL query

        let url = "https://jira.ericssonudn.net/rest/api/2/search" +
            "?jql=" + encodeURIComponent(jqlParam);

        //add fields filtering in the URL if needed
        if (jqlFields) {
            url += "&fields=" + encodeURIComponent(jqlFields);
        }

        if (jqlMaxResults) {
            //specify the maximum of records to return from the query
            url += "&maxResults=" + jqlMaxResults;
        }
        else {
            //by default, JIRA will return
            url += "&maxResults=1000";
        }

        console.log("jira query url", url);

        let jiraResponse = {
            "status": "FAILED",
            "results": []
        };
        request.get({
            url: url,
            headers: {
                "Authorization": self.getAuth()
            }
        }, function (error, response, body) {

            if (error) {
                jiraResponse.results = error;
            }
            else {

                if (body) {
                    try{
                        let jiraBody = JSON.parse(body);
                        if (jiraBody) {
                            if (jiraBody.issues) {
                                jiraResponse.status = "SUCCESS";
                                jiraResponse.results = jiraBody.issues;
                            }
                            else if (jiraBody.errorMessages) {
                                //send error
                                jiraResponse.results = jiraBody.errorMessages;
                            }
                        }
                    }
                    catch(e){
                        jiraResponse.status = "ERROR";
                        jiraResponse.results = "JIRA server rundown"
                    }
                }

            }
            res.send(jiraResponse);

        });
    });



    app.get("/query", function (req, res) {


        let jqlParam = req.query['jql'];
        let jqlFields = req.query['fields'];
        let startAt = 0; //req.query['startAt'];
        let maxResults = req.query['maxResults'];
        let jql2 = buildSecondJql(jqlParam);

        let items = new Items();

        if ( jql2 ) {
            doQuery(jql2, jqlFields, startAt, maxResults, res, items);
        }
        else {
            items.increaseCallNum();
        }
        doQuery(jqlParam, jqlFields, startAt, maxResults, res, items);
    });





    this.getCapacityMetrics = function(jqlParam,jqlFields,maxResults,callbackMetrics){

        let startAt = 0; //req.query['startAt'];
        let jql2 = buildSecondJql(jqlParam);

        let items = new Items();

        if ( jql2 ) {

            doQuery(jql2, jqlFields, startAt, maxResults, null, items, (result)=>{

                var capacity = new Capacity();
                var hoursFTEObject = capacity.getCapacityData(result);
                callbackMetrics(hoursFTEObject);
            });
        }
    }




    function buildSecondJql(jql) {
        try {
            if ( jql == undefined ) {
                return undefined;
            }

            let jqlUpper = jql.toUpperCase();
            let affectedVersion = 'AFFECTEDVERSION';
            let fixVersion = 'FIXVERSION';

            let idx = -1;
            let version = affectedVersion;
            idx = jqlUpper.indexOf(affectedVersion);
            if ( idx < 0 ) {
                version = fixVersion;
                idx = jqlUpper.indexOf(fixVersion);
            }

            if ( idx < 0 ) {
                return undefined;
            }

            idx = idx + version.length;
            let idx2 = idx;
            let eqa = jqlUpper.indexOf("=", idx);
            if ( eqa >= idx ) {
                idx = eqa + 1;
                idx2 = idx;
                do {
                    idx2++;
                    c = jqlUpper.charAt(idx2);
                }
                while ( c == ' ' || (c <= '9' && c >='0') || c == '.' )
            }

            let s1 = jql.substring(0, idx);
            let s2 = jql.substring(idx, idx2);
            let s3 = jql.substring(idx2);

            s2 = s2.trim();
            let fields = s2.split('.');


            if ( fields.length == 2 ) {
                return s1 + " " + s2 + ".0" + " " + s3;
            }
            else if ( fields.length == 3 ) {
                return s1 + " " + fields[0] + "." + fields[1] + " " + s3;
            }
        }
        catch(err) {
            console.log(err.message);
        }

        return undefined;
    }

    /**
     * Private Query JIRA REST API.
     * @param jql
     * @param fields
     * @param startAt
     * @param maxResults
     * @param res
     */
    function doQuery(jql, fields, startAt, maxResults, res, items, callback) {
        let url = self.buildUrl(jql, fields, startAt, maxResults);

        request.get({
            url: url,
            headers: {
                "Authorization": self.getAuth()
            }
        }, function (error, response, body) {
            try {

                if (error) {
                    if (items.getCallNum()  == 0) {
                        items.increaseCallNum();
                    }
                    else {
                        res.send(error);
                    }
                }
                let jiraData = JSON.parse(body);
                if (jiraData.issues) {
                    let startAt = jiraData.startAt === undefined ? 0 : jiraData.startAt;
                    let total = jiraData.total;
                    let maxResults = jiraData.maxResults;
                    let issues = jiraData.issues;
                    let issueSize = issues.length;
                    let count = 0;

                    if (issueSize < total) {

                        while (issueSize < total && count < 1000) {
                            count++;
                            startAt = issueSize;
                            url = self.buildUrl(jql, fields, startAt, maxResults);
                            let originalIssueSize = issues.length;


                            request.get({
                                url: url,
                                headers: {
                                    "Authorization": self.getAuth()
                                }
                            }, function (error2, response2, body2) {
                                try {

                                    let jiraChunk = JSON.parse(body2);
                                    if (jiraChunk.issues.length > 0) {
                                        issues = issues.concat(jiraChunk.issues);

                                    }

                                    if (issues.length == total) {
                                        if (items.getCallNum() == 0) {
                                            items.increaseCallNum()
                                            items.concatItems(issues);

                                        }
                                        else {
                                            items.concatItems(issues);
                                            if(res){
                                                res.send(JSON.stringify(items.getAllItems()));
                                            } else if(callback){
                                                callback(items.getAllItems())
                                            }
                                        }
                                    }
                                }
                                catch(err2) {
                                    console.log(err2.message);
                                }

                            });

                            issueSize += maxResults;
                        }
                    }
                    else {

                        if (items.getCallNum() == 0) {

                            items.increaseCallNum();
                            items.concatItems(issues);

                            if(res){
                                res.send(JSON.stringify(items.getAllItems()));
                            } else if(callback){
                                callback(items.getAllItems())
                            }
                        }
                        else {

                            items.concatItems(issues);

                            if(res){
                                res.send(JSON.stringify(items.getAllItems()));
                            } else if(callback){
                                callback(items.getAllItems())
                            }


                        }
                    }
                }
                else {

                    if (items.getCallNum() == 0) {
                        items.increaseCallNum();

                    }
                    else {
                        if(res){
                            res.send(body);
                        }
                        else if(callback){
                            callback(body)
                        }

                    }
                }
            }
            catch(err) {
                console.log(err.message);
            }
        });
    }
}

/**
 * Build the JIRA url with its query parameters
 * @param jql           - The JQL query
 * @param fields        - fields as filters that are returned from the query
 * @param startAt       - start index of the query result (default 0)
 * @param maxResults    - max number of results (default 1000)
 * @returns {string}    The JIRA query url
 */
JiraAPI.prototype.buildUrl = function (jql, fields, startAt, maxResults) {
    let defaultMaxResults = 1000;
    let defaultStartAt = 0;

    let urlPrefix = "https://jira.ericssonudn.net/rest/api/2/search?";

    let url = urlPrefix + "jql=" + jql;
    url = fields === undefined ? url : url +  "&fields=" + fields;
    url = startAt === undefined ? url + "&startAt=" + defaultStartAt : url +  "&startAt=" + startAt;
    url = maxResults === undefined || maxResults <= 0
        ? url + "&maxResults=" + defaultMaxResults
        : url +  "&maxResults=" + maxResults;

    return url;
};


JiraAPI.prototype.getResults = function(jql, fields, startAt, maxResults, callback) {
    let url = this.buildUrl(jql, fields, startAt, maxResults);


    request.get({
        url: url,
        headers: {
            "Authorization": this.getAuth()
        }
    }, function (error, response, body) {
        if (error) {
            //throw error;
        }

        if (callback) {
            callback(body);
        }

    });


};




module.exports = JiraAPI;