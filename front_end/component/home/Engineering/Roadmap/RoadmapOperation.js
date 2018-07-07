import {hashCode} from "../CommonFunction";
import {drawRoadmap} from "./SprintPlanScaleMarker"
import {getAllVersions} from '../CommonFunction'
import {getHttpRequest} from "../../../../httprequest/http_connection";

class RoadmapOperation {
    constructor() {
        this.sprintVersionGroupArray = [];
    }

    sprintVersionGroup(sprintDataArray) {

        this.sprintVersionGroupArray.splice(0,this.sprintVersionGroupArray.length);
        let groupVersionArray = this.sprintVersionGroupArray;
        sprintDataArray.map((element)=>{
            element.description = element.description.sort();
            let descriptionString = element.description.join('')
            let decriptionHashCode = hashCode(descriptionString);
            let findObject = groupVersionArray.find(obj=>obj.decriptionHashCode==decriptionHashCode);
            if(!findObject){ // we didn't find hashcode
                let object = {
                    decriptionHashCode:decriptionHashCode,
                    description:element.description,
                    version: element.version.toString(),
                    date:element.date
                }
                groupVersionArray.push(object);
            }
            else{ //we found now merge the version
                findObject.version = findObject.version+ ", " + element.version
            }
        })


        return groupVersionArray;
    }

    prepareSprintPlanDataArray(versionsArray,capabilities,roadmapData,roadmapDataFix){

        var versions = versionsArray;
        if (!versions) {
            versions = [];
        }
        var formatted = [];
        versions.map(function (element) {
            formatted.push(element);
        });

        var contentDescription = [];
        var versionArray = [];
        var capbilitiersArray = capabilities;
        var dataArray = [];

        var years = [];

        var roadmapData = roadmapData;

        capbilitiersArray.sort(function (value1, value2) {
            var date1 = new Date(value1.end_time);
            var date2 = new Date(value2.end_time);
            return (date1.getTime() - date2.getTime());
        });

        roadmapDataFix.map(function (element) {
            var endDate = new Date(element.end_time);
            if (years.indexOf(endDate.getFullYear()) < 0) {
                years.push(new Date(element.end_time).getFullYear());
            }
        });

        var endDate;
        roadmapData.map(function (element, index) {
            endDate = new Date(element.end_time);


            var description = [];
            var version = element.number;
            if (versionArray.indexOf(version) < 0) {
                versionArray.push(version);
                capbilitiersArray.map(function (value, index) {

                    if (version === value.number) {
                        if (value.capabilities) description.push(value.capabilities);
                    }
                });

                if ($.trim(description).length === 0) {
                    return;
                }
                contentDescription.push(description);
                var obj = {
                    'version': version,
                    'description': description,
                    'version_id': element.version_id,
                    'date': endDate
                }
                dataArray.push(obj);
            }
        });

        return dataArray;

    }

    /**
     * @description This function is called from RoadmapSprintPlan and is used to push data to create SVG.
     * @param {*} dataArray 
     */
    updateRoadMap(dataArray){
        let period = 12;

        let roadmapData = [];
        let selectedYear;

        dataArray.sort(function (value1, value2) {
            return (new Date(value1.end_time).getTime() - new Date(value2.end_time).getTime());
        });

        if (dataArray.length > 0) {
            selectedYear = new Date(dataArray[0].end_time).getFullYear();
        }

        dataArray.map(function (element) {
            if (new Date(element.end_time).getFullYear() == selectedYear) {
                roadmapData.push(element);
            }
        });
        
        
        if (roadmapData.length > 0) {
            drawRoadmap(roadmapData, period);
        }
    }

    getAllSprintData(currYear, callBack){

        var that = this;
        getAllVersions(currYear,function (versionArray) {

            var versions = versionArray;
            var versionsList = [];
            if(versions) {
                versions.map(function (data) {
                    versionsList.push(data.name);
                });
            }

            getHttpRequest("/getRoadmapData?versions=" + "'" + versionsList + "'", function (data) {
                var roadmapData = JSON.parse(data);
                roadmapData.rows.sort(function (value1, value2) {
                    return (new Date(value1.end_time).getTime() - new Date(value2.end_time).getTime());
                });

                getHttpRequest("/getCapabilities?versions=" + "'" + versionsList + "'", function (dataCapabilities) {
                    var capabilities = JSON.parse(dataCapabilities);

                    getHttpRequest("/get_udn_roadmap", function (data) {
                        var sprintDataArray = JSON.parse(data);

                        callBack(roadmapData,capabilities,sprintDataArray,versionsList)
                    });
                });
            });
        });



    }
}





export default RoadmapOperation
