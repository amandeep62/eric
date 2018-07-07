module.exports=class Capacity {
    /****
     * This one will perform capacity chart required javascript operations
     */
    constructor() {
        this.queryIssueTypesData = "'technical task', 'Test Task', 'Doc Task'";
        this.queryParamsData = '(CDX, UDNP, CS, "DO", DOC, LB, MON, AN, CIS, RelEng)';
        this.queryIssueTypeParam = '(Sub-task, task,' + this.queryIssueTypesData + ',Bug,Problem)';
        this.queryFieldsData =
            'project,status,issuetype,priority,customfield_11600,version,timeoriginalestimate,timeestimate, timespent';
        this.modulesArray = ["DO",
            "CDX",
            "DOC",
            "LB",
            "MON",
            "UDNP",
            "CIS",
            "CS",
            "RENG",
            "AN"];

        this.dataTimeEstimated = new Array(10);
        this.dataOriginalTimeEstimate = new Array(10);
        this.dataTimeSpent = new Array(10);
        this.dataTimeEstimatedChart2 = new Array(10);
        this.dataOriginalTimeEstimateChart2 = new Array(10);
        this.dataTimeSpentChart2 = new Array(10);

    }

    getCapacityData(resultOutput){
        let hoursFTEObject = this.formatData(resultOutput);
        return hoursFTEObject;
    }

    /***
     * This method will make ready the elements for bar chart
     * @param number   -  It will create the array with fixed length 10
     * @returns {Array} - It will return array with 10 elements
     */
    initArrayValues(number) {
        let array = [];
        for (let i = 0; i < number; i++) {
            array[i] = 0;
        }
        return array;
    }

    /***
     * This method will initialize the color's to the array
     * @param color - This parameter will initialize the backgroundColor
     * @param number - This parameter will be the fixed length of array
     * @returns {Array} - Returns the backgroundColor list
     */
    initBarColorArray(color, number) {
        let array = [];
        for (let i = 0; i < number; i++) {
            array[i] = color;
        }
        return array;
    }



    /***
     *  This method will use to format the data
     *  which we are going to display on the capacity chart
     * @param resultOutput
     */
    formatData(resultOutput) {
        let formatData = [];
        let sum = 0;
        this.dataTimeEstimated = new Array(10);
        this.dataOriginalTimeEstimate = new Array(10);
        this.dataTimeSpent = new Array(10);
        this.dataTimeEstimatedChart2 = new Array(10);
        this.dataOriginalTimeEstimateChart2 = new Array(10);
        this.dataTimeSpentChart2 = new Array(10);
        this.dataTimeEstimated = this.initArrayValues(10);
        this.dataOriginalTimeEstimate = this.initArrayValues(10);
        this.dataTimeSpent = this.initArrayValues(10);
        this.dataTimeEstimatedChart2 = this.initArrayValues(10);
        this.dataOriginalTimeEstimateChart2 = this.initArrayValues(10);
        this.dataTimeSpentChart2 = this.initArrayValues(10);
        if(resultOutput.length > 0) {
            resultOutput.forEach(function (element) {
                let obj = {
                    name: element.fields.project.key,
                    time_estimate: element.fields.timeestimate,
                    time_original_estimate: element.fields.timeoriginalestimate,
                    time_spent: element.fields.timespent
                };
                formatData.push(obj);
            });

            formatData.forEach( (element)=> {
                let indexElement = this.modulesArray.indexOf(element.name);

                //Create time estimated array
                sum = this.dataTimeEstimated[indexElement];
                let valueTime = element.time_estimate ? parseInt(element.time_estimate) : 0;
                sum = sum + valueTime;
                this.dataTimeEstimated[indexElement] = sum;

                //Create original time estimation array
                sum = this.dataOriginalTimeEstimate[indexElement];
                let valueTime_original_estimate = element.time_original_estimate ?
                    parseInt(element.time_original_estimate) : 0;
                sum = sum + valueTime_original_estimate;
                this.dataOriginalTimeEstimate[indexElement] = sum;

                //Create spent time array
                sum = this.dataTimeSpent[indexElement];
                let valueTimeSpent = element.time_spent ? parseInt(element.time_spent) : 0;
                sum = sum + valueTimeSpent;
                this.dataTimeSpent[indexElement] = sum;
            });
        }

        for (let i = 0; i < this.modulesArray.length; i++) {
            this.dataTimeEstimated[i] = (this.dataTimeEstimated[i] / 3600).toFixed(0);
            this.dataOriginalTimeEstimate[i] = (this.dataOriginalTimeEstimate[i] / 3600).toFixed(0);
            this.dataTimeSpent[i] = (this.dataTimeSpent[i] / 3600).toFixed(0);
        }

        for (let i = 0; i < this.modulesArray.length; i++) {
            this.dataTimeEstimatedChart2[i] = (this.dataTimeEstimated[i] / 80).toFixed(0);
            this.dataOriginalTimeEstimateChart2[i] = (this.dataOriginalTimeEstimate[i] / 80).toFixed(0);
            this.dataTimeSpentChart2[i] = (this.dataTimeSpent[i] / 80).toFixed(0);
        }
        // It will return hoursFTEObject
        return this.drawCapacityBarCharts(
            this.dataTimeSpent,
            this.dataOriginalTimeEstimate,
            this.dataTimeSpentChart2,
            this.dataOriginalTimeEstimateChart2,
            this.dataTimeEstimatedChart2
        );
    }


    /***
     *
     * @param dataTimeSpent  - This one is for time spent on the jira tickets
     * @param dataOriginalTimeEstimate - This one is original estimate time for tickets
     * @param dataTimeSpentChart2 - This one is for time spent on the jira tickets for second chart
     * @param dataOriginalTimeEstimateChart2 - This one is original estimate time for tickets for second chart
     * @param dataTimeEstimatedChart2
     * @returns {{hoursDataArray: *[], fteDataArray: *[]}}
     */
    drawCapacityBarCharts(dataTimeSpent,
                          dataOriginalTimeEstimate,
                          dataTimeSpentChart2,
                          dataOriginalTimeEstimateChart2,
                          dataTimeEstimatedChart2) {


        let hoursDataArray = [dataTimeSpent, dataOriginalTimeEstimate, this.dataTimeEstimated];
        let fteDataArray = [dataTimeSpentChart2, this.dataOriginalTimeEstimateChart2, dataTimeEstimatedChart2];

        return {
            hoursDataArray:hoursDataArray,
            fteDataArray:fteDataArray};


    }

}
