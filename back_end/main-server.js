
var pjson = require('../package.json');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.config.js');
var process = require('process');
var rp = require('request-promise');
var JiraClient = require('jira-connector');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? pjson["port"] : process.env.PORT;

var fs = require('fs');
var url = require('url');
var path = require('path');
var mime = require('mime');
var http = require('http');
var https = require('https');
var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser');

var servicesConfig = require('./config/config.js');
var configJira = require('./config/config.json');

var db = require('./dbconnectionpool');
var SearchEngineIndexing = require ('./searchEngineIndexing');
var moduleDevelopment = require('./development')
var capacityServices = require('./Capacity/CapacityServices')
var issueServices = require('./Issues/IssueServices')
// var moduleSqlQuery = require('./sqlquery')
var modeleUdnPortal = require('./udnportal')
var moduleJiraBackupScheduler = require('./jiraBackupScheduler')
var querystring = require('querystring');
var jiraApi = require('./jiraApiRequest');
var summaryRoadMap = require('./summary_roadmap');
var editQuality = require('./edit_quality');
var editScope = require('./edit_scope');
var developmentKPI = require('./developmentKPI');
var createPDF = require('./create_pdf');
var chinaUDNPortal = require('./chinaUDNPortal');
var formidable = require('formidable');
var prodReadiness = require('./product_readiness');
var platfomrBoard = require('./platform_board');
var sqlstoredprocedurequery = require('./sqlstoredprocedurequery');
var moduleSalesforce = require('./salesforce');







//Read configuration file first. Any module can get config.data.
servicesConfig.init();

console.log(servicesConfig.data.environment);

let serverKey = (servicesConfig.data.environment == 'dev' || servicesConfig.data.environment == 'prod') ? __dirname+'/godaddy/dashboard.key' : __dirname+'/../server.key';
let serverCrt = (servicesConfig.data.environment == 'dev' || servicesConfig.data.environment == 'prod') ? __dirname+'/godaddy/bf30eaf8807a4e07.crt' : __dirname+'/../server.crt';

let options = null;

console.log(serverKey);
console.log(serverCrt);




let serverCrtFileExist = fs.existsSync(serverCrt);
let serverKeyFileExist = fs.existsSync(serverKey);

if(serverKeyFileExist && serverCrtFileExist){
    options = {
        key  : fs.readFileSync(serverKey),
        cert : fs.readFileSync(serverCrt),
        passphrase: pjson["passphrase"]
    };
}



global.udnPortalAuthKey=0;



var app = express();
app.use(session({
    secret: 'ericsson-2017',
    cookie: {
        maxAge: 5*60*60*1000
    },
    resave: true,
    saveUninitialized: true,
    rolling: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


moduleDevelopment.init(app,db);
moduleSalesforce.init(app,db);

//get database connection instance
db.init();

//start the search engine indexing
let searchEngineIndexing = new SearchEngineIndexing(app, db);
searchEngineIndexing.init(app, db);

//initialize JIRA object
let jiraObj = new jiraApi(app);
jiraObj.init();

var jira1 = new JiraClient( {
    host: configJira.jira.host,
    basic_auth: {
        username: configJira.jira.username,
        password: configJira.jira.password
    }
});

//initialize scheduler for copying JIRA releases info to a separate database
let jiraBackupScheduler = new moduleJiraBackupScheduler(app);
jiraBackupScheduler.init();

modeleUdnPortal.init(app,db);
summaryRoadMap.init(app,db);
editQuality.init(app,db);
editScope.init(app,db);
developmentKPI.init(app,db);
createPDF.init(app);
chinaUDNPortal.init(app,db);
prodReadiness.init(app,db);
platfomrBoard.init(app,db);
sqlstoredprocedurequery.init(db)
capacityServices.init(app,db,jiraObj);
issueServices.init(app,db,jira1);


var ip = process.platform=='linux'? pjson["server-ip"]:pjson["local-ip"];

const compiler = webpack(config);
const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
        colors: true,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false,
        modules: false
    }
});

app.use(middleware);
app.use(express.static(__dirname + '/../public'));
app.use(webpackHotMiddleware(compiler));

// var webhook =jira1.webhook;
// webhook.createWebhook(
//     {
//         name:"UDNDashboard",
//         url:"http://34.211.133.158:8088/rest/webhooks/pushnotification",
//     },
//      function(error, response) {
//        // console.log("error", error)
//         // console.log("response", response)
//     }
// )


app.get('/salesforceSession',function(req,res){
    var user_id = req.query.user_id
    console.log("user_id: " +user_id);
    console.log("req.session.user_id: " +req.session.user_id);
    if(req.session.user_id && req.session.user_id == user_id){
        var userObj={message:'success',statusCode:200,user_id:req.session.user_id}
        res.status(200).send(userObj);
    }
    else{
        res.status(401).send('');
    }
});

app.get('/salesforceLogin',function(req,res){
    res.redirect("https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=3MVG9GnaLrwG9TQTOZs7OKnZSnNQI7aXin5JGMgCqGgPwyDKSLPfz8ZHAXdbAGD6F9kDXAVsk.9fg9tQ6.dG2&redirect_uri=https://dashboard.ericssonudn.com/salesforceCallback");
});

app.get('/salesforceCallback',function(req,res){
    var code = req.query["code"];
    var postData = {
        'grant_type' : 'authorization_code',
        'client_secret': '2937100931005857099',
        'client_id': '3MVG9GnaLrwG9TQTOZs7OKnZSnNQI7aXin5JGMgCqGgPwyDKSLPfz8ZHAXdbAGD6F9kDXAVsk.9fg9tQ6.dG2',
        'redirect_uri':'https://dashboard.ericssonudn.com/salesforceCallback',
        'code' : code
    };
    postBody = querystring.stringify(postData);

    var options = {
        host: 'login.salesforce.com',
        path: '/services/oauth2/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postBody.length
        }
    };

    var postreq = https.request(options, function (postRes) {
        var body = '';
        postRes.setEncoding('utf8');
        postRes.on('data', function (chunk) {
            body += chunk;
        });
        postRes.on('end',function(){
            var chunkParse = JSON.parse(body);
            try{
                if(chunkParse.access_token){
                    var option1 = {
                        host: 'login.salesforce.com',
                        path: '/services/oauth2/userinfo',
                        method: 'POST',
                        headers: {
                            'Accept': 'application/JSON',
                            'Authorization': 'Bearer ' +chunkParse.access_token
                        }
                    };
                    var bodyInfo='';
                    var postUserReq = https.request(option1, function(postInfo){
                        postInfo.setEncoding('utf8');
                        postInfo.on('data',function(chuckInfo){
                            bodyInfo += chuckInfo;
                        });
                        postInfo.on('end',function(){
                            var chunkParseInfo = JSON.parse(bodyInfo);
                            var date = new Date();
                            try{
                                db.all('Select * from Login where user_name = ?',[chunkParseInfo.preferred_username], function(err3,res3){
                                    if(err3){
                                        console.log('error:'+err1);
                                        var errorMsg = "Unable to process request please try again 1";
                                        res.redirect('/login?errorMessage='+errorMsg);
                                    }else{
                                        var queryStr=null;
                                        if(res3.length < 1){
                                            queryStr="INSERT INTO Login (user_name,email,password,first_name,last_name,role_type,lastLoginTimeStamp) VALUES('"+chunkParseInfo.preferred_username+"','"+chunkParseInfo.email+"','*','"+chunkParseInfo.given_name+"','"+chunkParseInfo.family_name+"','2','"+date+"')";
                                        }else{
                                            queryStr="Update Login SET email='"+chunkParseInfo.email+"',first_name='"+chunkParseInfo.first_name+"',last_name='"+chunkParseInfo.last_name+"',lastLoginTimeStamp='"+date+"' WHERE user_name='"+chunkParseInfo.preferred_usernam+"'";
                                        }
                                        db.run(queryStr,function(err1,res1){
                                            if(err1){
                                                console.log('error:'+err1);
                                                var errorMsg = "Unable to process request please try again 2 "+err1;
                                                res.redirect('/login?errorMessage='+errorMsg);
                                            }else{
                                                db.all('Select * from Login where user_name = ?',[chunkParseInfo.preferred_username], function(err2,res2){
                                                    if(err2){
                                                        console.log('error:'+err1);
                                                        var errorMsg = "Unable to process request please try again 3";
                                                        res.redirect('/login?errorMessage='+errorMsg);
                                                    }else{
                                                        if(res2.length < 1){
                                                            var errorMsg = "Unable to process request please try again 4";
                                                            res.redirect('/login?errorMessage='+errorMsg);
                                                        }else{
                                                            if(res2[0].role_type == '1'){
                                                                req.session.user_id = "Admin-Session";
                                                                req.session.username = chunkParseInfo.preferred_username;
                                                                res.redirect('/login?user_id='+"Admin-Session");
                                                            }else{
                                                                req.session.user_id = "Sales-Session";
                                                                req.session.username = chunkParseInfo.preferred_username;
                                                                res.redirect('/login?user_id='+"Sales-Session");
                                                            }
                                                        }
                                                    }
                                                });

                                            }
                                        });
                                    }
                                });
                            }catch(e){
                                console.log(e);
                            }


                        });
                    });
                    postUserReq.end();
                }else{
                    var errorMsg = "Unable to process request please try again 5";
                    res.redirect('/login?errorMessage='+errorMsg);
                }
            }catch(error){
                console.log("error"+error);
                var errorMsg = "Unable to process request please try again 6";
                res.redirect('/login?errorMessage='+errorMsg);
            }
        });
    });
    postreq.write(postBody);
    postreq.end();
});





app.get('/loginAs',function(req,res){
    var type = req.session.user_id;
    res.send(type);
});


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/login')
})

app.get('/js/UI.js', function(req, res) {
    var fileName = "";
    if (req.session.user_id == "Admin-Session") {
        fileName = '/client/js/UIAdmin.js';
    } else if (req.session.user_id == "Sales-Session") {
        fileName = '/client/js/UISales.js';
    } else if (req.session.user_id == "View-Session") {
        fileName = '/client/js/UIView.js';
    }
    res.sendFile(fileName, {
        root: __dirname
    })
});
app.post('/login', function(req, res) {
    var post = req.body;
    try{
        db.run("CALL LoginAuthenticate_proc(?,?)",[post.username,post.password],function(err,rows){

            var rowsString = JSON.stringify(rows);

            rows = JSON.parse(rowsString);


            if(err){
                console.log("error:"+ JSON.stringify(err));
                var errorMsg = 'Unable to process the request please try again';
                res.send({message:errorMsg,statusCode:404});
            }else{
                if(!rows[0]){
                    var errorMsg = 'Invalid username and password';
                    res.send({message:errorMsg,statusCode:404});
                }else{

                    var row = rows[0][0];
                    if(parseInt(row.role_type) == 1){
                        req.session.user_id = "Admin-Session";
                        req.session.username = post.username;
                        res.send({message:'success',statusCode:200,user_id:req.session.user_id,role_type:rows[0].role_type});

                    }else if(parseInt(row.role_type) == 2){
                        req.session.user_id = "Sales-Session";
                        req.session.username = post.username;
                        res.send({message:'success',statusCode:200,user_id:req.session.user_id,role_type:rows[0].role_type});

                    }else{
                        var errorMsg = 'Authentication required please contact admin';
                        res.send({message:errorMsg,statusCode:401});

                    }

                }

            }
        });
    }catch(e){
        console.log(e);
    }

});


app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

var pageAccess = function (req, res) {
    if(!req.session.user_id){
        res.redirect('/login');
    }else{
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
}

app.get('/kpi', [pageAccess])

app.get('/engineering/productreadiness', [pageAccess])

app.get('/engineering/roadmap', [pageAccess])

app.get('/engineering/platformboard', [pageAccess])

app.get('/engineering/releasedashboard', [pageAccess])

app.get('/engineering/status', [pageAccess])

app.get('/engineering/capacity', [pageAccess])

app.get('/engineering/trends', [pageAccess])

app.get('/engineering/quality', [pageAccess])

app.get('/engineering/fst', [pageAccess])

app.get('/engineering/process', [pageAccess])

app.get('/engineering/trends', [pageAccess])

app.get('/traffic', [pageAccess])


app.get('/engineering/*', function(req, res) {
    var path = req.path.replace("/engineering/",'/')
    res.redirect(path);
});



/**
 * Signout from portal
 */
app.get('/signout', function(req, res) {
    delete req.session.user_id;
    delete req.session.username;
    res.send('success');
});

app.get('/versions', function(req, res) {
    try{
        db.all("SELECT * FROM version ORDER BY number ASC", function(err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                res.send("Internal Error");
            } else {
                res.send(rows);
            }
        });
    }catch(e){
        console.log(e);
    }
    
});

app.get('/years', function(req, res) {
    try{
        db.all("SELECT * FROM years ORDER BY year ASC", function(err, rows) {
            if (err) {
                console.log(JSON.stringify(err));
                res.send("Internal Error");
            } else {
                res.send(rows);
            }
        });
    }catch(e){
        console.log(e);
    }

});

/**
 * Get the list of versions for a specific year. The version id 0 is ommitted (representing the Summary).
 */
app.get('/versionsByYear', function(req, res) {
    var year = req.query["year"];

    var query = "SELECT v.version_id, v.name,CONCAT(CAST(v.number AS DECIMAL(4,1))) AS number, \n" +
        "        v.date, v.type, YEAR(STR_TO_DATE(end_time, '%Y-%m-%d')) AS relyear\n" +
        "FROM\n" +
        "  release_timeschedule\n" +
        "  JOIN (\n" +
        "    SELECT version_id, MAX(phase_id) AS phase_id\n" +
        "    FROM release_timeschedule \n" +
        "    GROUP BY version_id\n" +
        "  ) maxphase_id   \n" +
        "    \tON release_timeschedule.version_id = maxphase_id.version_id \n" +
        "        AND release_timeschedule.phase_id = maxphase_id.phase_id\n" +
        "        AND YEAR(STR_TO_DATE(end_time, '%Y-%m-%d'))="+year+"\n" +
        "        INNER JOIN version v\n" +
        "        ON v.version_id = release_timeschedule.version_id";

        try{
            db.all(query, function(err, rows) {
                if (err) {
                    res.send("Internal Error");
                } else {
                    res.send(rows);
                }
            });
        }catch(e){
            console.log(e);
        }
    

});

app.get('/UserAccess', function (req,res){
    if(req.session.user_id == 'Admin-Session'){
        var fs = require('fs');
        var path = process.cwd();
        var buffer = fs.readFileSync(path + "/public/UserAccess.html");
        res.send(buffer.toString());
    }else{
        console.log("false");
        var fs = require('fs');
        var path = process.cwd();
        //var buffer = fs.readFileSync(path + "/UserLogin.html");
        req.session.destroy();
        res.redirect(path + "/");
    }
});


app.get('/editCMS_KPI', function (req,res){
    if(req.session.user_id == 'Admin-Session'){
        var fs = require('fs');
        var path = process.cwd();
        var buffer = fs.readFileSync(path + "/public/CMS/DevelopmentCMS_KPI.html");
        res.send(buffer.toString());
    }else{
        console.log("false");
        var fs = require('fs');
        var path = process.cwd();
        //var buffer = fs.readFileSync(path + "/UserLogin.html");
        req.session.destroy();
        res.redirect(path + "/");
    }
});
app.post('/uploadPDF', function (req, res){

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = true;

    // store all uploads in the /uploads directory

    //form.uploadDir = path.join(__dirname, '/uploads');
    form.uploadDir = './public/uploadPdf';

    // every time a file has been uploaded successfully,
    // rename it to it's orignal name
    form.on('file', function(field, file) {
        /*        let query = "Insert into processPdf(file_name,file_path) values ('" + file.name + "','" + form.uploadDir + "')";*/
        fs.rename(file.path, path.join(form.uploadDir, file.name));

    });

    // log any errors that occur
    form.on('error', function (err) {
        console.log('An error has occurred: \n' + err);
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
        res.end('success');
    });

    // parse the incoming request containing the form data
    form.parse(req);
});
app.get('/getAllPdfLists', function (req, res) {
    let files = fs.readdirSync('./public/uploadPdf/');
    let dataArray = [];
    files.map((element)=> {
        if(element.indexOf('pdf') !== -1){
            dataArray.push(element)
        }
    });

    //console.log(dataArray);
    res.send(dataArray);
});


app.get('/userAccessTable', function (req, res) {
    var post = req.body;
    var userArray = new Array();
    try{
        db.all("SELECT * from Login", function(err, rows) {
            if(!err) {
                rows.forEach(function (row) {
    
                    var dict = {
                        roleType: row.role_type,
                        firstName: row.first_name,
                        lastName: row.last_name,
                        email: row.email,
                        userName: row.user_name
                    }
                    userArray.push(dict);
                })
            }
    
            res.send(userArray);
        });
    }catch(e){
        console.log(e);
    }
    

});


app.get('/updateUserRoleType', function (req, res) {

    var userName = req.query.userName;
    var roleType = req.query.roleType;
//Perform INSERT operation.
    var queryStr = "update Login set role_type ="+roleType+" where user_name='"+userName+"'";
    try{
        db.run(queryStr,function(err1,res1){
        if(err1){
            res.send("Unable to update please try again");
        }else{
            if(roleType == 1){
                res.send(userName+" changed to Admin");
            }else{
                res.send(userName+" changed to Sales");
            }
        }
    });
    }catch(e){
        console.log(e);
    }
    
});


function search(buttonID, array){
    for (var i=0; i < array.length; i++) {
        if (array[i].buttonID === buttonID) {
            return i;
        }
    }
    return -1;
}


function unsupportedFunctionality(customerStatus,customerRegion,res) {

    try{
        db.all("SELECT button_id as buttonID FROM feature WHERE feature_id NOT IN (SELECT feature_id FROM feature_version)", function(err, rows) {
            
                    var allUnsupportedFeatures = [];
                    rows.forEach(function (element) {
                        allUnsupportedFeatures.push({"buttonID": element.buttonID, "buttonCount": 0});
                    });
            
                    db.all("SELECT f.button_id AS buttonID, count(f.button_id) AS buttonCount FROM feature f\
                           INNER JOIN customer_feature cf ON (f.feature_id = cf.feature_id)\
                           WHERE cf.feature_id NOT IN (SELECT feature_id FROM feature_version)\
                           GROUP BY f.button_id", function(err, rows) {
                        if (err) {
                            res.send("Internal Error");
                        } else {
                            var features = rows;
            
                            features.forEach(function (element) {
                                var index = search(element.buttonID, allUnsupportedFeatures);
                                allUnsupportedFeatures[index].buttonCount = element.buttonCount;
                            });
            
                            allUnsupportedFeatures.sort(function(a, b) {
                                return (a.buttonCount < b.buttonCount) ? 1 : ((b.buttonCount < a.buttonCount) ? -1 : 0);
                            });
            
                            var customerStatusArray = customerStatus.split(',');
                            var customerRegionArray = customerRegion.split(',');
                            var customerJoinArray = customerStatusArray.concat(customerRegionArray);
                            var customerStatusQuestionMarkString = customerStatusArray.map(function() {
                                return '?'
                            }).join(',');
                            var customerRegionQuestionMarkString = customerRegionArray.map(function(){
                                return '?'
                            }).join(',');
                            // Add this to the below Query
                            // AND c.region IN ("+ customerRegionQuestionMarkString +") \
            
                            db.all("SELECT COUNT(*) AS customersCount \
                                FROM \
                                (SELECT c.name, c.customer_id, c.revenue \
                                FROM customer c \
                                INNER JOIN customer_feature cf ON c.customer_id = cf.customer_id  \
                                INNER JOIN feature f on cf.feature_id = f.feature_id  \
                                WHERE cf.feature_id IN \
                                (SELECT feature_id FROM feature WHERE feature_id NOT IN (SELECT feature_id FROM feature_version)) \
                                AND c.status IN (" + customerStatusQuestionMarkString + ") \
                                AND c.region IN ("+ customerRegionQuestionMarkString +") \
                                GROUP BY cf.customer_id \
                                )", customerJoinArray, function(err, rows) {
                                if (err) {
                                    res.send("Internal Error");
                                } else {
                                    if (rows.length > 0) {
                                        res.send({
                                            "features":allUnsupportedFeatures,
                                            "customersCount":rows[0]["customersCount"]
                                        });
                                    } else {
                                        res.send("Internal Error");
                                    }
                                }
                            });
                        }
                    });
                });
    }catch(e){
        console.log(e);
    }
    
}

//--------------------------------------------------------------------
// The third SQL fails in MySQL, but works in sqllite3.
// This needs to be rewritten for MySQL.
// Commenting as of now.
//--------------------------------------------------------------------
function functionalityForVersionID(customerStatus,customerRegion,versionID, res) {

    db.all("SELECT f.button_id AS buttonID \
        FROM feature f INNER JOIN feature_version fv ON (f.feature_id = fv.feature_id) \
        WHERE fv.version_id = ? \
    GROUP BY f.button_id ", [versionID], function(err, rows) {

        var allFeatures = [];
        rows.forEach(function (element) {
            allFeatures.push({"buttonID": element.buttonID, "buttonCount": 0});
        });

        var customerStatusArray = customerStatus.split(',');
        var customerRegionArray = customerRegion.split(',');
        var customerStatusQuestionMarkString = customerStatusArray.map(function() {
            return '?'
        }).join(',');
        var customerRegionQuestionMarkString = customerRegionArray.map(function(){
            return '?'
        }).join(',');

        db.all("SELECT f.button_id AS buttonID, COUNT(f.button_id) AS buttonCount \
        FROM feature f INNER JOIN customer_feature cf ON (f.feature_id = cf.feature_id) \
        INNER JOIN feature_version fv ON (f.feature_id = fv.feature_id) \
        WHERE fv.version_id = ? \
        AND cf.customer_id IN (SELECT c.customer_id \
        FROM customer c  \
        INNER JOIN customer_feature cf ON c.customer_id = cf.customer_id  \
        INNER JOIN feature f on cf.feature_id = f.feature_id  \
        WHERE cf.feature_id IN (SELECT feature_id from feature_version where version_id = ?)  \
        GROUP BY cf.customer_id  \
        HAVING count(cf.customer_id) >=  \
        (SELECT count(*) as featuresCount  \
        FROM customer_feature  \
        WHERE customer_id = cf.customer_id  \
        GROUP by customer_id  \
        LIMIT 1)) \
        GROUP BY f.button_id", [versionID, versionID], function(err, rows) {
            if (err) {
                res.send("Internal Error");
            } else {

                var features = rows;

                features.forEach(function (element) {
                    var index = search(element.buttonID, allFeatures);
                    allFeatures[index].buttonCount = element.buttonCount;
                });

                allFeatures.sort(function(a, b) {
                    return (a.buttonCount < b.buttonCount) ? 1 : ((b.buttonCount < a.buttonCount) ? -1 : 0);
                });

                // ADD this to below code
                // AND c.region IN ("+ customerRegionQuestionMarkString +")

                db.all("SELECT count(*) AS customersCount FROM \
                (SELECT c.name, c.customer_id, c.revenue \
                FROM customer c  \
                INNER JOIN customer_feature cf ON c.customer_id = cf.customer_id  \
                INNER JOIN feature f on cf.feature_id = f.feature_id  \
                WHERE cf.feature_id IN (SELECT feature_id from feature_version where version_id = ?)  \
                GROUP BY cf.customer_id  \
                HAVING count(cf.customer_id) >=  \
                (SELECT count(*) as featuresCount  \
                FROM customer_feature  \
                WHERE customer_id = cf.customer_id  \
                GROUP by customer_id  \
                LIMIT 1) \
                AND c.status IN (" + customerStatusQuestionMarkString + ") \
                AND c.region IN ("+ customerRegionQuestionMarkString +") \
                )",
                    [versionID].concat(customerStatusArray,customerRegionArray), function(err, rows) {
                        if (err) {
                            res.send("Internal Error");
                        } else {
                            if (rows.length > 0) {
                                res.send({
                                    "features":allFeatures,
                                    "customersCount":rows[0]["customersCount"]
                                });
                            } else {
                                res.send("Internal Error");
                            }
                        }
                    });
            }
        });
    });
};

app.get('/get_functionality', function(req, res) {
    var isUnsupported = req.query["isUnsupported"];
    var customerStatus = req.query["customerStatus"];
    var customerRegion = req.query["customerRegion"];
    if (isUnsupported === null || (!customerStatus && customerStatus !== "") || (!customerRegion && customerRegion !== "")) {
        res.send("Invalid query");
        return;
    }
    if (isUnsupported == "true") {
        unsupportedFunctionality(customerStatus,customerRegion,res);
    } else {
        var versionID = req.query["version_id"];
        if (!versionID) {
            res.send("Invalid query");
            return;
        }
        // When the above method is fixed,  enable this function call.
        // functionalityForVersionID(customerStatus,customerRegion,versionID, res)
    }
});

app.get('/create_version', function(req, res) {
    var versionName = req.query["version_name"];
    var versionNumber = req.query["version_number"];
    var versionDate = getFormattedDate(req.query["version_date"]);
    if (!versionName || !versionNumber || !versionDate) {
        res.send("Invalid query");
        return;
    }

    try{
        db.run("INSERT INTO version (name, number, date) VALUES (?, ?, ?)", [versionName, versionNumber, versionDate], function(err) {
        if (err) {
            res.send("Internal Error");
        } else {
            res.send({
                "name": versionName,
                "version_id": this.lastID,
                "date": versionDate,
                "number": versionNumber
            });
        }
    });
    }catch(e){
        console.log(e);
    }
    
});

app.get('/rename_version', function(req, res) {
    var versionName = req.query["version_name"];
    var versionID = req.query["version_id"];
    var versionDate = getFormattedDate(req.query["version_date"]);

    if (!versionName || !versionID || !versionDate) {
        res.send("Invalid query");
        return;
    }
    try{
        db.run("UPDATE version SET name = ?, date = ? WHERE version_id = ?", [versionName, versionDate, versionID], function(err) {
        if (err) {
            res.send("Internal Error");
        } else {
            db.all("SELECT * FROM version WHERE version_id = ?", [versionID], function(err, rows) {
                if (err) {
                    res.send("Internal Error");
                } else {
                    res.send(rows[0]);
                }
            });
        }
    });
    }catch(e){
        console.log(e);
    }
    
});

function getFormattedDate(input) {
    var components = input.split("-");
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var year = parseInt(components[0]);
    var month = parseInt(components[1]);
    var day = parseInt(components[2]);
    return day + " " + months[(month - 1)];
}

app.get('/remove_version', function(req, res) {
    var versionId = req.query["version_id"];
    if (!versionId) {
        res.send("Invalid query");
        return;
    }
    try{
        db.run("DELETE FROM version WHERE version_id = ?", [versionId], function(err) {
            if (err) {
                res.send("Internal Error");
            } else {
                res.send({
                    "success": true
                });
            }
        });
    }catch(e){
        console.log(e);
    }
    
});

app.get('/version_features', function(req, res) {
    var versionId = req.query["id"];
    if (!versionId) {
        res.send("Invalid query");
        return;
    }
    try{
        db.all("SELECT f.button_id " +
        "FROM feature f, feature_version fv " +
        "WHERE f.feature_id = fv.feature_id " +
        "AND fv.version_id = ?", [versionId], function(err, rows) {
        if (err) {
            console.log(JSON.stringify(err));
            res.send("Internal Error");
        } else {
            var buttonsArray = [];
            rows.forEach(function(row) {
                buttonsArray.push(row["button_id"]);
            });
            res.send({
                "selectedButtons": buttonsArray
            });
        }
    });
    }catch(e){
        console.log(e);
    }
    

});

app.get('/version_supporting_buttons', function(req, res) {

    var selectedButtonsIDs = req.query["selected_buttons_ids"];

    if ((!selectedButtonsIDs && selectedButtonsIDs !== "")) {
        res.send("Invalid query");
        return;
    }

    var selectedButtonsIDsArray = selectedButtonsIDs.split(',');
    var buttonsIDsQuestionMarkString = selectedButtonsIDsArray.map(function() {
        return '?'
    }).join(',');

    try{
        db.all("SELECT feature_id FROM feature WHERE button_id IN (" + buttonsIDsQuestionMarkString + ")",
        selectedButtonsIDsArray,
        function(err, rows) {
            if (err) {
                res.send("Internal Error");
            } else {
                var selectedFeaturesIDs = [];
                rows.forEach(function(row) {
                    selectedFeaturesIDs.push(row["feature_id"]);
                });

                var selectedFeaturesIDsQuestionMarkString = selectedFeaturesIDs.map(function() {
                    return '?'
                }).join(',');

                var query = selectedFeaturesIDs.length == 0 ? "SELECT v.name, v.number, v.date, v.version_id \
                    FROM version v \
                    WHERE v.version_id NOT IN (SELECT version_id FROM feature_version) \
                    GROUP BY v.version_id \
                    ORDER BY number ASC \
                    LIMIT 1" : "SELECT v.name, v.number, v.date, v.version_id \
                    FROM version v \
                    INNER JOIN feature_version fv ON v.version_id = fv.version_id \
                    INNER JOIN feature f on fv.feature_id = f.feature_id \
                    WHERE fv.feature_id IN (" + selectedFeaturesIDsQuestionMarkString + ") \
                    GROUP BY fv.version_id\
                    HAVING count(fv.feature_id) = ? \
                    ORDER BY number ASC \
                    LIMIT 1";

                var parameters = selectedFeaturesIDs;
                parameters.push(selectedFeaturesIDs.length)
                parameters = selectedFeaturesIDs.length == 0 ? parameters : [];
                db.all(query, parameters, function(err, rows) {
                    if (err) {
                        res.send("Internal Error");
                    } else {
                        if (rows.length > 0) {
                            res.send({
                                "firstVersion": rows[0],
                            });
                        } else {
                            res.send("Unsupported Customer");
                        }
                    }
                });
            }
        });
    }catch(e){
        console.log(e);
    }
    
});

app.get('/edit_version_features', function(req, res) {
    var selectedButtonsIDs = req.query["selected_buttons_ids"];
    var isEmptyString = selectedButtonsIDs === "";
    var versionId = req.query["version_id"];
    if ((!selectedButtonsIDs && !isEmptyString) || !versionId) {
        res.send("Invalid query");
        return;
    }
    try{
        db.run("DELETE FROM feature_version WHERE version_id = ?", [versionId], function(err) {
            if (err) {
                res.send("Internal Error");
            } else {
                var selectedButtonsIDsArray = selectedButtonsIDs.split(',');
                var questionMarkString = selectedButtonsIDsArray.map(function() {
                    return '?'
                }).join(',');
                db.all("SELECT feature_id FROM feature WHERE button_id IN (" + questionMarkString + ")",
                    selectedButtonsIDsArray,
                    function(err, rows) {
                        if (err) {
                            res.send("Internal Error");
                        } else {
                            var desiredFeaturesIDs = [];
                            rows.forEach(function(row) {
                                desiredFeaturesIDs.push(row["feature_id"]);
                                db.run("BEGIN");
    
                            });
                            desiredFeaturesIDs.forEach(function(featureId) {
                                db.run("INSERT INTO feature_version (version_id, feature_id) VALUES (?, ?)", [versionId, featureId],
                                    function(err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    }
                                );
                            });
                            db.run("COMMIT", function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    res.send({
                                        "success": true,
                                        "buttons_ids": selectedButtonsIDs
                                    });
                                }
                            });
                        }
                    });
            }
        });
    }catch(e){
        console.log(e);
    }
    
});

app.get('/search_customer', function(req, res) {
    var customerName = req.query["customer_name"];
    if (!customerName) {
        res.send("Invalid query");
        return;
    }
    customerName = "'%" + customerName + "%'";
    var query = "SELECT name, customer_id, revenue FROM customer WHERE name LIKE " + customerName + " ORDER BY revenue DESC";
    try{
        db.all(query, function(err, rows) {
        if (err) {
            res.send("Internal Error");
        } else {
            res.send({
                "supportedCustomers": rows
            });
        }
    });
    }catch(e){
        console.log(e);
    }
    
});

app.get('/getAllCustomers',function(req,res){
    var query = "SELECT * FROM customer ORDER BY revenue DESC";
    try{
        db.all(query, function(err, rows) {
        if (err) {
            res.send("Internal Error");
        } else {
            res.send({
                "supportedCustomers": rows
            });
        }
    });
    }catch(e){
        console.log(e);
    }
    
});

app.get('/unsupported_customers_and_features', function(req, res) {

    var customerStatus = req.query["customerStatus"];
    var customerRegion = req.query["customerRegion"];
    if ((!customerStatus && customerStatus !== "" ) || (!customerRegion && customerRegion !== "")) {
        res.send("Invalid query");
        return;
    }

    try{
        db.all("SELECT feature_id, button_id as buttonID FROM feature WHERE feature_id NOT IN (SELECT feature_id FROM feature_version)", function(err, rows) {
            if (err) {
                res.send("Internal Error");
            } else {
                var unsupportedFeaturesIDs = [];
                var unsupportedButtonsIDs = [];
                rows.forEach(function(row) {
                    unsupportedFeaturesIDs.push(row["feature_id"]);
                    unsupportedButtonsIDs.push(row["buttonID"]);
                });
    
                var customerStatusArray = customerStatus.split(',');
                var customerRegionArray = customerRegion.split(',');
                var customerStatusQuestionMarkString = customerStatusArray.map(function() {
                    return '?'
                }).join(',');
                var customerRegionQuestionMarkString = customerRegionArray.map(function(){
                    return '?'
                }).join(',');
    
                /* Add this to below query
                 AND c.region IN ("+ customerRegionQuestionMarkString +") \ */
    
                var query = "SELECT c.name, c.customer_id, c.revenue \
                        FROM customer c \
                        INNER JOIN customer_feature cf ON c.customer_id = cf.customer_id  \
                        INNER JOIN feature f on cf.feature_id = f.feature_id  \
                        WHERE cf.feature_id IN (" + unsupportedFeaturesIDs.toString() + ") \
                        AND c.status IN (" + customerStatusQuestionMarkString + ")\
                        AND c.region IN ("+ customerRegionQuestionMarkString +") \
                        GROUP BY cf.customer_id \
                        ORDER BY revenue DESC";
                db.all(query, customerStatusArray.concat(customerRegionArray), function(err, rows) {
                    if (err) {
                        res.send("Internal Error");
                    } else {
                        res.send({
                            "unsupportedCustomers": rows,
                            "unsupportedButtons": unsupportedButtonsIDs
                        });
                    }
                });
            }
        });
    }catch(e){
        console.log(e);
    }
    
});
app.get('/getStatusFilters', function(req,res){
    try{
        db.all("Select distinct(status) as status from customer where status != 'Discovery'", function(err, rows){
        if(err){
            res.send("Invalid query");
        }else{
            res.send(rows);
        }
    });
    }catch(e){
        console.log(e);
    }
    
});

app.get('/getRegionFilters', function(req,res){
    try{
       db.all("Select distinct(region) as status from customer ", function(err, rows){
        if(err){
            res.send("Invalid query");
        }else{
            res.send(rows);
        }
    }); 
    }catch(e){
        console.log(e);
    }
    
});



app.get('/customers', function(req, res) {

    var selectedButtonsIDs = req.query["selected_buttons_ids"];
    var customerStatus = req.query["customerStatus"];
    var customerRegion = req.query["customerRegion"];
    if ((!selectedButtonsIDs && selectedButtonsIDs !== "") || (!customerStatus && customerStatus !== "") || (!customerRegion && customerRegion !== "")) {
        res.send("Invalid query");
        return;
    }

    var customerStatusArray = customerStatus.split(',');
    var customerStatusQuestionMarkString = customerStatusArray.map(function() {
        return '?'
    }).join(',');
    var customerRegionArray = customerRegion.split(',');
    var customerRegionQuestionMarkString = customerRegionArray.map(function(){
        return '?'
    }).join(',');
    var selectedButtonsIDsArray = selectedButtonsIDs.split(',');
    var buttonsIDsQuestionMarkString = selectedButtonsIDsArray.map(function() {
        return '?'
    }).join(',');

    try{
        db.all("SELECT feature_id FROM feature WHERE button_id IN (" + buttonsIDsQuestionMarkString + ")",
        selectedButtonsIDsArray, function(err, rows) {
            if (err) {
                res.send("Internal Error1");
            } else {
                var selectedFeaturesIDs = [];
                rows.forEach(function(row) {
                    selectedFeaturesIDs.push(row["feature_id"]);
                });

                if (selectedFeaturesIDs.length == 0) {
                    /*
                     ADD this to below query
                     AND c.region IN ("+ customerRegionQuestionMarkString +") \*/
                    db.all("SELECT c.name, c.customer_id, c.revenue \
                    FROM customer c \
                    WHERE NOT EXISTS (SELECT * \
                    FROM customer_feature cf \
                    WHERE cf.customer_id = c.customer_id) \
                    AND c.status IN (" + customerStatusQuestionMarkString + ")\
                    AND c.region IN ("+ customerRegionQuestionMarkString +") \
                    ORDER BY revenue DESC", customerStatusArray.concat(customerRegionArray), function(err, rows) {
                        if (err) {
                            res.send("Internal Error2");
                        } else {
                            res.send({
                                "supportedCustomers": rows
                            });
                        }
                    });
                } else {
                    var selectedFeaturesIDsQuestionMarkString = selectedFeaturesIDs.map(function() {
                        return '?'
                    }).join(',');

                    var query = "SELECT c.name, c.customer_id, c.revenue\
                    FROM customer c \
                    INNER JOIN customer_feature cf ON c.customer_id = cf.customer_id \
                    INNER JOIN feature f on cf.feature_id = f.feature_id \
                    WHERE cf.feature_id IN (" + selectedFeaturesIDsQuestionMarkString + ") \
                    GROUP BY cf.customer_id \
                    HAVING count(cf.customer_id) \>= \
                    (SELECT count(*) as featuresCount \
                    FROM customer_feature \
                    WHERE customer_id = cf.customer_id \
                    GROUP by customer_id \
                    LIMIT 1)\
                    AND c.status IN (" + customerStatusQuestionMarkString + ") \
                    AND c.region IN ("+ customerRegionQuestionMarkString +") \
                    ORDER BY revenue DESC";

                    /* This need to be added in above query
                     AND c.region IN ("+ customerRegionQuestionMarkString +") */

                    db.all(query, selectedFeaturesIDs.concat(customerStatusArray,customerRegionArray), function(err, rows) {
                        if (err) {
                            res.send("Internal Error3");
                        } else {
                            res.send({
                                "supportedCustomers": rows
                            });
                        }
                    });
                }
            }
        });
    }catch(e){
        console.log(e);
    }
    
});

// app.get('/getRegionFilters', function(req,res){
//     db.all("Select distinct(region) as region, 1 as checked  from customer ", function(err, rows){
//         if(err){
//             res.send("Invalid query");
//         }else{
//             res.send({
//                 'row' : rows
//             });
//         }
//     });
// });

app.get('/getStatusFilters',function (req,res) {
    db.all("Select distinct(status) as status, 1 as checked  from customer ", function(err, rows){
        if(err){
            res.send("Invalid query");
        }else{
            res.send({
                'row' : rows
            });
        }
    });
});

// app.get('/getRegionFilters', function(req,res){
//     db.all("Select distinct(region) as region, 1 as checked  from customer ", function(err, rows){
//         if(err){
//             res.send("Invalid query");
//         }else{
//             res.send({
//                 'row' : rows
//             });
//         }
//     });
// });

app.get('/customer_features', function(req, res) {
    var customerID = req.query["customer_id"];
    if (!customerID) {
        res.send("Invalid query");
        return;
    }
    db.all("SELECT f.button_id, cf.input_value, f.type\
    FROM feature f \
    INNER JOIN customer_feature cf ON c.customer_id = cf.customer_id \
    INNER JOIN customer c on cf.feature_id = f.feature_id \
    WHERE cf.customer_id = ?", [customerID], function(err, rows) {
        if (err) {
            res.send("Internal Error");
        } else {
            var buttonsIDs = [];
            var textboxes = [];
            rows.forEach(function(row) {
                buttonsIDs.push(row["button_id"]);
                if (row["type"] == 1) {
                    textboxes.push(row);
                }
            });

            res.send({
                "buttons_ids": buttonsIDs,
                "textboxes": textboxes
            });
        }
    });
});

app.get('/edit_customer_features', function(req, res) {
    var selectedButtonsIDs = req.query["selected_buttons_ids"];
    var isEmptyString = selectedButtonsIDs === "";
    var customerId = req.query["customer_id"];
    if ((!selectedButtonsIDs && !isEmptyString) || !customerId) {
        res.send("Invalid query");
        return;
    }

    db.run("DELETE FROM customer_feature WHERE customer_id = ?", [customerId], function(err) {
        if (err) {
            res.send("Internal Error");
        } else {

            var selectedButtonsIDsArray = selectedButtonsIDs.split(',');
            var questionMarkString = selectedButtonsIDsArray.map(function() {
                return '?'
            }).join(',');

            db.all("SELECT feature_id, button_id FROM feature WHERE button_id IN (" + questionMarkString + ")",
                selectedButtonsIDsArray,
                function(err, rows) {
                    if (err) {
                        res.send("Internal Error");
                    } else {

                        var textboxesString = req.query["input_values"];
                        var textboxes = JSON.parse(textboxesString);

                        var desiredFeatures = [];
                        var textboxesResponse = [];
                        rows.forEach(function(row) {
                            var textBox = textboxes.find(function(element) {
                                return element.button_id == row["button_id"];
                            });
                            var inputValue = null;
                            if (textBox) {
                                inputValue = textBox["input_value"];
                                textboxesResponse.push({feature_id: row["feature_id"],
                                    button_id: row["button_id"], input_value: inputValue});

                            }
                            desiredFeatures.push({feature_id: row["feature_id"], input_value: inputValue});
                        });

                        db.run("BEGIN");
                        desiredFeatures.forEach(function(feature) {
                            db.run("INSERT INTO customer_feature (customer_id, feature_id, input_value) VALUES (?, ?, ?)",
                                [customerId, feature.feature_id, feature.input_value], function(err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                        });
                        db.run("END", function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.send({
                                    "success": true,
                                    "textboxes": textboxesResponse,
                                    "buttons_ids": selectedButtonsIDs
                                });
                            }
                        });
                    }
                });
        }
    });
});


if(options != null){
    var server =  https.createServer(options, app).listen(443, ip, function onStart(err) {

        if (err) {
            console.log(err);
        }

        console.info('==> 🌎 Listening on port %s. Open up https://%s:%s/ in your browser.', 443, ip, 443);
    });


    http.createServer(function (req, res) {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(port, ip, function onStart(err) {

        if (err) {
            console.log(err);
        }

        console.info('==> 🌎 Listening on port %s. Open up http://%s:%s/ in your browser.', port, ip, port);
    });
}else{
    http.createServer(app).listen(port, ip, function onStart(err) {

        if (err) {
            console.log(err);
        }

        console.info('==> 🌎 Listening on port %s. Open up http://%s:%s/ in your browser.', port, ip, port);
    });
}

function checkAuth(req, res, next) {
    var publicPaths = [
        "/login",
        "/salesforceCallback",
        "/salesforceLogin",
        "/css/logincss.css",
        "/css/style.css",
        "/js/http_connection.js",
        "/CMS/JSX/DevelopmentCMS_KPI.js",
        "/CMS/NewsEditor/external/google-code-prettify/prettify.js",
        "/CMS/NewsEditor/index.css",
        "/CMS/NewsEditor/bootstrap-wysiwyg.js",
        "/CMS/NewsEditor/js/bootstrap-datepicker.js",
        "/CMS/NewsEditor/css/bootstrap-datepicker.css",
        "/CMS/NewsEditor/external/jquery.hotkeys.js",
        "/css/font-css.css",
        "/images/loginBG.jpg", "/images/loginIcon.svg", "/images/lockIcon.svg",
        "/fonts/montserrat-light-webfont.woff2",
        "/fonts/montserrat-regular-webfont.woff2",
    ];

    var salesRestrictedPaths = ["/create_version",
        "/rename_version",
        "/remove_version",
        "/index-admin.html"
    ];

    var viewRestrictedPaths = ["/create_version",
        "/rename_version",
        "/remove_version",
        "/index-admin.html",
        "/index-sales.html"
    ];

    if (!req.session.user_id && publicPaths.indexOf(req.path) == -1) {
        res.setHeader('Location', "/login");
        res.redirect("/login");
    } else if (req.session.user_id == "Sales-Session" && salesRestrictedPaths.indexOf(req.path) != -1) {
        res.send("Unauthorized");
    } else if (req.session.user_id == "View-Session" && viewRestrictedPaths.indexOf(req.path) != -1) {
        res.send("Unauthorized");
    } else {
        res.setHeader('Location', req.path);
        next();
    }
}
























