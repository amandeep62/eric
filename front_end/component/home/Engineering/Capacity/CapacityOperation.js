import {getAllModules} from '../CommonFunction'
import {getHttpRequest} from "../../../../httprequest/http_connection";

class CapacityOperation {
    /****
     * This one will perform capacity chart required javascript operations
     */
    constructor() {
        this.queryIssueTypesData = "'technical task', 'Test Task', 'Doc Task'";
        this.queryParamsData = '(CDX, UDNP, CS, "DO", DOC, LB, MON, AN, CIS, RelEng)';
        this.queryIssueTypeParam = '(Sub-task, task,' + this.queryIssueTypesData + ',Bug,Problem)';
        this.queryFieldsData =
            'project,status,issuetype,priority,customfield_11600,version,timeoriginalestimate,timeestimate, timespent';


    }


    /***
     * This method will use to get the data for capacity tab
     * @param versionId - Passed version id to get the data for specific version
     * @param callback  - returns the data in the callback where it's get called
     */
    getCapacityData(versionId,versionNumber, callback) {
          let queryString = "/capacityMetrics?jql=project in " + this.queryParamsData
            + " AND fixVersion = " + versionNumber + " AND issuetype in "
            + this.queryIssueTypeParam + "&fields=" + this.queryFieldsData + "&maxResults=1000&versionId="+versionId;
        getHttpRequest(queryString, (result) => {
            let resultOutput = JSON.parse(result);

            if(resultOutput.length === 0) {

                callback({hoursDataArray:[], fteDataArray:[]});

            }
            else{
                let hoursFTEObject = resultOutput;
                callback(hoursFTEObject);

            }


        });
    }


}

export default CapacityOperation;