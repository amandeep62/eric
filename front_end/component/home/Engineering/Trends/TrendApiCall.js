import { MONTHS } from "../../../../constants/constants";
import {getHttpRequest} from "../../../../httprequest/http_connection";
export const TrendsApiData = (project, startDate, endDate, trendsType, callback)=> {
    getHttpRequest('/trendsInflowOutflowBacklogs?project=' + project + '&startDate=' + startDate + '&endDate=' + endDate + '&trendsType=' + trendsType, (result) => {

        let barChartInAndOutFlow = [];
        let barChartInAndOutFlowJql = [];
        let lineChartForBacklog = [];
        let lineChartForBacklogJql = [];
        let barChartInAndOutFlowLabels = [];
        let barChartInAndOutFlowLabelsSub = [];

        let barChartInAndOutFlowYearLabels = [];
        let totalBacklogLine = [];
        let totalBacklogLineJql = [];
        let triageBacklogLine = [];
        let triageBacklogLineJql = [];
        let testBacklogLine = [];
        let testBacklogLineJql = [];
        let devBacklogLine = [];
        let devBacklogLineJql = [];

        let results = JSON.parse(result);
        let inflowElement;

        /***
         *
         * @param item : DO needs to change to DevOps as it's a JIRA Keyword.
         */
        let replaceDo = function (item) {
            return item ? item.replace(/\b(?!(?:.\B)*(.)(?:\B.)*\1)[DO]+\b/g, 'DevOps') : "";
        };

        /***
         *
         * @param dataResults : Data Array needs for iteration
         * @param backlogArray : Array needs to be filled for backlog
         * @param jqlArray : Array needs to be filled for JQL
         */
        let formatBacklogResults = function (dataResults, backlogArray, jqlArray) {
            dataResults.map((element, index) => {
                backlogArray.push(element.statusCount);
                jqlArray.push(replaceDo(element.jql));
            });
        };


        let formatInAndOutFlowResults = function () {
            results.backlog.map((item, index) => {
                switch (trendsType) {
                    case 'Monthly':
                        let monthValue = MONTHS[item.month - 1];
                        if( item.month === 1 || index === 0)
                            barChartInAndOutFlowLabelsSub.push(item.year);
                        else
                            barChartInAndOutFlowLabelsSub.push("");
                        barChartInAndOutFlowLabels.push(monthValue);
                        inflowElement = results.inflow.find(itemInflow=>itemInflow.year === item.year && itemInflow.month === item.month && itemInflow.day === item.day);
                        break;
                    case 'Yearly':
                        barChartInAndOutFlowLabels.push(item.year);
                        inflowElement = results.inflow.find(itemInflow=>itemInflow.year === item.year && itemInflow.month === item.month);
                        break;
                    case 'Quarterly':
                        if(index === 0 || item.quarter === 1)
                            barChartInAndOutFlowLabels.push(item.year + "Q" + item.quarter);
                        else
                            barChartInAndOutFlowLabels.push("Q" + item.quarter);
                        inflowElement = results.inflow.find(itemInflow=>itemInflow.year === item.year && itemInflow.quarter === item.quarter);
                        break;
                    case 'Weekly':
                        if(index === 0 || item.week === 1)
                            barChartInAndOutFlowLabels.push(item.year + "-" + item.week);
                        else
                            barChartInAndOutFlowLabels.push(item.week);
                        inflowElement = results.inflow.find(itemInflow=>itemInflow.year === item.year && itemInflow.week === item.week);
                        break;
                    case 'Daily':
                        if(index === 0 || item.day === 1)
                            barChartInAndOutFlowLabels.push(item.month + "/" + item.day);
                        else
                            barChartInAndOutFlowLabels.push(item.day);
                        inflowElement = results.inflow.find(itemInflow=>itemInflow.year === item.year && itemInflow.month === item.month && itemInflow.day === item.day);
                        break;
                }
                lineChartForBacklog.push(item.statusCount);
                barChartInAndOutFlow.push(inflowElement ? inflowElement.statusCount : 0);
                barChartInAndOutFlow.push(results.outflow[index].statusCount);
                barChartInAndOutFlowJql.push( inflowElement ? replaceDo(inflowElement.jql) : "" );
                barChartInAndOutFlowJql.push(replaceDo(results.outflow[index].jql));
                lineChartForBacklogJql.push(replaceDo(item.jql));
            });
        };
        formatInAndOutFlowResults();
        formatBacklogResults(results.backlog, totalBacklogLine, totalBacklogLineJql);
        formatBacklogResults(results.triage, triageBacklogLine, triageBacklogLineJql);
        formatBacklogResults(results.intest, testBacklogLine, testBacklogLineJql);
        formatBacklogResults(results.dev, devBacklogLine, devBacklogLineJql);

        callback({
            barChartInAndOutFlow : barChartInAndOutFlow,
            barChartInAndOutFlowJql : barChartInAndOutFlowJql,
            lineChartForBacklog :  lineChartForBacklog,
            lineChartForBacklogJql : lineChartForBacklogJql,
            barChartInAndOutFlowLabels :  barChartInAndOutFlowLabels,
            barChartInAndOutFlowLabelsSub : barChartInAndOutFlowLabelsSub,
            barChartInAndOutFlowYearLabels :  barChartInAndOutFlowYearLabels,
            totalBacklogLine: totalBacklogLine,
            totalBacklogLineJql: totalBacklogLineJql,
            triageBacklogLine: triageBacklogLine,
            triageBacklogLineJql: triageBacklogLineJql,
            testBacklogLine: testBacklogLine,
            testBacklogLineJql: testBacklogLineJql,
            devBacklogLine: devBacklogLine,
            devBacklogLineJql: devBacklogLineJql
        })

    });
};