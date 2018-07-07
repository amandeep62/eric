/*
This module acts as scheduler that fecthes information from JIRA and persists it in a separate database.
 */

const db = require("./dbconnectionpool");
const config = require("./config/config.js");
const jiraApi = require('./jiraApiRequest');



/**
 * Constructor
 * @param _app
 * @constructor
 */
function JiraBackupScheduler(_app) {
    this.app = _app;
    this.release_scopes = [];
    //map of version id with its number
    this.versionsTable = {};
    //map of module id with its name
    this.modulesTable = {};

    var self = this;

    /**
     * Load the release scopes from the db and save it into a data structure
     * @param callback Method to call after the db query is done
     */
    this.loadReleaseScopes = function(callback) {
        //load data from DB
        var query = "SELECT release_scope.scope_id, version.number as version_number, module.module_name as module_name, " +
            "release_scope.release_theme, release_scope.capabilities, release_scope.description " +
            "FROM release_scope " +
            "INNER JOIN version ON version.version_id=release_scope.version_id " +
            "INNER JOIN module ON module.module_id=release_scope.module_id;";
            try{
                db.all(query, function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                self.release_scopes = rows;

                if (callback)
                    callback;

            }
        });
        db.close();
            }catch(e){
                console.log(e);
            }
            
    };

    /**
     * Load all the version ids and their associated numbers and save them into a data structure
     * @param callback
     */
    this.loadVersionsFromDb = function(callback) {
        var query = "SELECT * " +
            "FROM version";
            try{
                db.all(query, function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                for (var i=0; i<rows.length; i++) {
                    self.versionsTable[rows[i].version_id] = rows[i].number;
                }

                if (callback) {
                    callback;
                }


            }
        });
        db.close();
            }catch(e){
                console.log(e);
            }
        
    }

    /**
     * Load all the modules ids and their associated names and save them into a data structure
     * @param callback
     */
    this.loadModulesFromDb = function(callback) {
        var query = "SELECT * " +
            "FROM module";
            try{
                db.all(query, function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                for (var i=0; i<rows.length; i++) {
                    self.modulesTable[rows[i].module_id] = rows[i].module_name;
                }

                if (callback)
                    callback;

            }
        });
        db.close();
            }catch(e){
                console.log(e);
            }
        
    }


    /**
     * Get the version id
     * @param versionNumber
     * @returns {*}
     */
    this.getVersionId = function(versionNumber) {
        let tokens = versionNumber.split(".");
        if (tokens.length > 1 && tokens[tokens.length-1] == "0") {
            versionNumber = versionNumber.substr(0, versionNumber.length-2);
        }

        let versionId = 5;//5: unmapped version (by default if no match is found)
        for (var id in this.versionsTable) {
            // use hasOwnProperty to filter out keys from the Object.prototype
            if (this.versionsTable.hasOwnProperty(id)) {
                if (versionNumber == this.versionsTable[id]) {
                    versionId = parseInt(id);
                    break;
                }


            }
        }

        return versionId;
    }


    /**
     * Get the modulde id
     * @param moduleName
     * @returns {*}
     */
    this.getModuleId = function(moduleName) {
        let moduleId = 11;
        for (var id in this.modulesTable) {
            // use hasOwnProperty to filter out keys from the Object.prototype
            if (this.modulesTable.hasOwnProperty(id)) {
                if (moduleName == this.modulesTable[id]) {
                    moduleId = parseInt(id);
                    break;
                }


            }
        }

        return moduleId;

    }


    /**
     * Write the JIRA release scopes
     * @param insertValuesArray Batch of values to insert (array of values)
     * array of array of params. The size corresponds to the number of queries to execute in one transaction.
     * e.g. insertValuesArray = [ [a, b, c], [d, e, f], ...., [x, y ,z]
     */
    this.writeJiraReleaseScopeToDb = function(insertValuesArray) {

        if (insertValuesArray.length == 0) {
            //close the connection
            console.log("There is no value to insert.")
            return;
        }

        var query = "INSERT INTO release_scope (version_id, module_id, release_theme, capabilities, description, issue_key) " +
            "VALUES ?";

        var self = this;

        try{
            //insert the data
        db.transactionQuery(query, [insertValuesArray], function (args) {
            if (args) {
                console.log("Transaction done - message: " + args);
            }
        });
        }catch(e){
            console.log(e);
        }
        

    }


    /**
     * Write the JIRA release scopes by batch (if api doesn't provide transactions, this is a workaround)
     * No rollback is available
     * @param insertValuesArray Batch of values to insert (array of values)
     */
    this.writeJiraReleaseScopeBatchToDb = function(insertValuesArray) {

        //---base case: when does the transaction stop?---//
        if (insertValuesArray.length == 0) {
            //close the connection
            console.log("Transaction done. Closing the db connection.")
            db.close();
            return;
        }

        //---recursive case---//
        var query = "INSERT INTO release_scope (version_id, module_id, release_theme, capabilities, description,issue_key) " +
            "VALUES(?,?,?,?,?,?);"

        var self = this;

        try{
            //insert the data
        db.run(query, insertValuesArray[0], function (err, rows) {
            if (err) {
                console.log(err);
                console.log("Error in INSERT query " + insertValuesArray[0] + ". Closing the db connection.");
                db.close();
            } else {

                insertValuesArray.shift();
                //recursive call
                self.writeJiraReleaseScopeBatchToDb(insertValuesArray );
            }
        });
        }catch(e){
            console.log(e);
        }
        

    }


    /**
     * Load the JIRA data that we need to insert in the database
     * @param callback Method to call after the request to JIRA rest api is completed
     *
     * Mapping of JIRA fields with release_scope fields from udn_dashboard DB:
     *      - fixVersions.versionIndex.name -> version_name ("version" table) -> version_id ("release_scope" table)
     *      - project.key ->  module_name ( "module" table) -> module_id ("release_scope" table)
     *      - customfield_11602.value -> release_theme ("release_scope" table)
     *      - summary -> capabilities ("release_scope" table)
     *      - customfield_11601 -> description ("release_scope" table)
     */
    this.loadJiraData = function() {
        //fetch data from JIRA
        let queryParam = encodeURI("project in (CDX, UDNP, CS, \"DO\", Documentation, LB, MON, AN, CIS, RelEng) " +
            "AND issuetype=Story");


        let jiraObj = new jiraApi(this.app);
        jiraObj.getResults(queryParam, "fixVersions, project, customfield_11602, summary, key, customfield_11601", 0, 0,
            self.jiraCallback);
    };

    /**
     * Method to backup
     */
    this.backup = function () {

        console.log("Backup initiated");
        //TODO there must be a better way then nesting calls to  functions. e.g. using promises.
        self.loadVersionsFromDb(self.loadModulesFromDb(self.loadJiraData()));


    };


    /**
     * Callback after jira data has been loaded
     * @param body
     * @param error
     */
    this.jiraCallback = function(body, error) {
        if (error) {
            throw error;
            return;
        }

        //get the list of issues
        let jiraData = JSON.parse(body);
        let issues = jiraData['issues'];


        let insertValuesArray = [];
        //go through every issue from JIRA and check whether it needs to be added to the database or updated.

        for (let i=0; i<issues.length; i++) {
            let key = issues[i]['key'];
            let issue = issues[i]['fields'];
            console.log("Issues in the response", key);

            if (issue) {


                let module_id;
                let module_name = (issue['project']) ? issue['project']['key'] : 'ALL';
                module_id = self.getModuleId(module_name);

                let release_theme = (issue['customfield_11602']) ? issue['customfield_11602']['value'] : "";

                //make sure that these values don't have quotation marks double quotes that could
                let capabilities = (issue['summary']) ? issue['summary'] : "unavailable";
                let description = (issue['customfield_11601']) ? issue['customfield_11601'] : "";
                let issue_key = key;

                //you can have several assigned versions or none
                if (issue['fixVersions'].length == 0) {
                    let version_number = "1000000000";
                    let version_id = self.getVersionId(version_number);

                    let values = [version_id, module_id, "'" + release_theme + "'", "'" + capabilities + "'", "'" +
                    description + "'","'" + issue_key + "'"];
                    let valuesParam = [version_id, module_id, release_theme, capabilities, description,issue_key];

                    //prepare the data to be inserted into the database in batch
                    insertValuesArray.push(valuesParam);
                } else {
                    for (let versionIndex=0; versionIndex < issue['fixVersions'].length; versionIndex++) {
                        let version_number = issue['fixVersions'][versionIndex]['name'];
                        let version_id = self.getVersionId(version_number);

                        let values = [version_id, module_id, "'" + release_theme + "'", "'" + capabilities + "'", "'" +
                        description + "'","'" + issue_key + "'"];
                        let valuesParam = [version_id, module_id, release_theme, capabilities, description,issue_key];

                        //prepare the data to be inserted into the database in batch
                        insertValuesArray.push(valuesParam);
                    }
                }

            }
        }

        self.writeJiraReleaseScopeToDb(insertValuesArray);
    }
}

/**
 * Starts a cron job
 */
JiraBackupScheduler.prototype.init = function (){
    var self = this;

    //just to make sure what we have a pool of connections
    db.getPool();

    //Create an endpoint enabling manual push for Jira backup
    this.app.get("/pushJiraBackup", function (req, res) {
        self.backup();
        res.status(200).send();
    });
};



module.exports = JiraBackupScheduler;
