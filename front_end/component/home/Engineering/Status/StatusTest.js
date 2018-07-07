import {Component} from 'react';
import {
    JIRA_LINK_URL,
    CHART_TITLE_ENUM,
    DOUGHNUT_CHART_SCOPE_ENUM,
    DOUGHNUT_CHART_MENU_ITEM_ENUM,
    DOUGHNUT_CHART_HIGHLIGHT_COLOR
} from "../../../../constants/constants";
import {
    generateBackgroundColor,
    arrayContains,
    getListOfVersionNumbersFromVersion, getMenuItems
} from "../CommonFunction";
import DoughnutChart from "../../globals/Charts/DoughnutChart";
import {
    DEV_ISSUETYPE_IN_TEST, BUG_ISSUETYPE_IN_TEST, DONE_STATUS_IN_TEST, REMAINING_STATUS_IN_TEST
} from "./Status"
import "./status.less";


/**
 * Enumeration of categories of data to represent in the DEV chart (Status tab)
 * @type {{}}
 */
const TEST_CHART_CAT_ENUM = {
    DONE: "TEST COMPLETED",
    REMAINING: "TEST REMAINING "
};


/**
 * @description     : Component to create the TEST view with graphs
 */
class StatusTest extends Component {

    /**
     * Build the Test View page with the dev charts
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);

        this.onTestChartMenuClick = this.onTestChartMenuClick.bind(this);


        this.state = {
            testChartTitle: CHART_TITLE_ENUM.TEST,
            testChartData: [],
            testChartLabels: [],
            testChartMenu: [],
            testChartColorArray: [],
            devChartLegendData: []
        };



    }


    /**
     * Wait until everything is mounted before rendering the chart data
     */
    componentDidMount() {
        this.updateChartData(this.props.chartData);
    }


    /**
     * Will receive updates on the new chart data  (with the new selected version or module).
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        this.updateChartData(nextProps.chartData);

    }


    //================================ PRIVATE METHODS ================================//

    updateChartData(data) {
        let statusData = this.getStatusData(data);

        let doneCount = statusData.DONE.DEV + statusData.DONE.BUG;
        let remainingCount = statusData.REMAINING.DEV + statusData.REMAINING.BUG;

        let chartData = [doneCount, remainingCount];
        let chartLabels = [TEST_CHART_CAT_ENUM.DONE, TEST_CHART_CAT_ENUM.REMAINING];


        let doneMenuItems = getMenuItems(
            [
                DOUGHNUT_CHART_MENU_ITEM_ENUM.DEV + ": " + statusData.DONE.DEV,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.BUG + ": " + statusData.DONE.BUG
            ]);
        let remainingMenuItems = getMenuItems(
            [
                DOUGHNUT_CHART_MENU_ITEM_ENUM.DEV + ": " + statusData.REMAINING.DEV,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.BUG + ": " + statusData.REMAINING.BUG
            ]);

        //make sure that the menu items oreder are corresponding to the labels ones
        let chartMenu = [doneMenuItems, remainingMenuItems];

        let chartColorArray = generateBackgroundColor(chartData.length);

        //build the links for DEV and BUG counts and add them to the legends
        let doneDevJqlQuery = this.getTestQueryString(DOUGHNUT_CHART_MENU_ITEM_ENUM.DEV, TEST_CHART_CAT_ENUM.DONE);
        let doneBugJqlQuery = this.getTestQueryString(DOUGHNUT_CHART_MENU_ITEM_ENUM.BUG, TEST_CHART_CAT_ENUM.DONE);
        let remDevJqlQuery = this.getTestQueryString(DOUGHNUT_CHART_MENU_ITEM_ENUM.DEV, TEST_CHART_CAT_ENUM.REMAINING);
        let remBugJqlQuery = this.getTestQueryString(DOUGHNUT_CHART_MENU_ITEM_ENUM.BUG, TEST_CHART_CAT_ENUM.REMAINING);

        let legends = [
            {
                name : TEST_CHART_CAT_ENUM.DONE,
                percentage : ((doneCount / (doneCount + remainingCount)) * 100).toFixed(),
                distributions : [
                    {
                        name : DOUGHNUT_CHART_MENU_ITEM_ENUM.DEV,
                        count : statusData.DONE.DEV,
                        link   : JIRA_LINK_URL + '?jql=' + doneDevJqlQuery
                    },
                    {
                        name : DOUGHNUT_CHART_MENU_ITEM_ENUM.BUG,
                        count : statusData.DONE.BUG,
                        link   : JIRA_LINK_URL + '?jql=' + doneBugJqlQuery
                    }
                ]
            },
            {
                name : TEST_CHART_CAT_ENUM.REMAINING,
                percentage : ((remainingCount / (doneCount + remainingCount)) * 100).toFixed(),
                distributions : [
                    {
                        name : DOUGHNUT_CHART_MENU_ITEM_ENUM.DEV,
                        count : statusData.REMAINING.DEV,
                        link   : JIRA_LINK_URL + '?jql=' + remDevJqlQuery
                    },
                    {
                        name : DOUGHNUT_CHART_MENU_ITEM_ENUM.BUG,
                        count : statusData.REMAINING.BUG,
                        link   : JIRA_LINK_URL + '?jql=' + remBugJqlQuery
                    }
                ]
            }
        ];

        this.setState({
            testChartTitle: CHART_TITLE_ENUM.TEST,
            testChartData: chartData,
            testChartLabels: chartLabels,
            testChartMenu: chartMenu,
            testChartColorArray: chartColorArray,
            devChartLegendData: legends
        });
    }




    /**
     * Get the statis data for TEST. This data will be used to draw a graph.
     *
     * @param data The data used to draw the graph with.
     * @return the data for dev status
     */
    getStatusData(data) {

        let statusDataForTest = {
            "DONE": {"DEV": 0, "BUG": 0},
            "REMAINING": {"DEV": 0, "BUG": 0}
        };

        if (data && data.length > 0) {
            //let fullCount = data.length;
            //statusDataForDev.count = fullCount;
            statusDataForTest.DONE = this.getDoneStatusData(data);
            statusDataForTest.REMAINING = this.getRemainingStatusData(data);
        }

        return statusDataForTest;

    }


    /**
     * Get the list of status for DONE issues for TEST
     * issue types: 'Done', 'Ready for Test', 'In Test'
     */
    getDoneStatusData(data) {

        let doneData = {DEV: 0, BUG: 0};


        let filteredData = data.filter(currentData =>
            arrayContains(DONE_STATUS_IN_TEST, currentData.status.toLowerCase())
        );

        //get the DEV count `
        doneData.DEV = this.getDevIssueCount(filteredData);

        //get the TEST count
        doneData.BUG = this.getBugIssueCount(filteredData);


        return doneData;
    }



    /**
     * Get the list of status for REMAINING (NOT DONE) issues for TEST
     * issue types: 'Reopened', 'To Do', 'In Progress', 'In Triage', 'In Review', 'Scheduled'
     */
    getRemainingStatusData(data) {
        let remainingData = {DEV: 0, BUG: 0};

        let filteredData = data.filter(currentData =>
            arrayContains(REMAINING_STATUS_IN_TEST, currentData.status.toLowerCase())
        );

        //get the DEV count `
        remainingData.DEV = this.getDevIssueCount(filteredData);

        //get the TEST count
        remainingData.BUG = this.getBugIssueCount(filteredData);

        return remainingData;
    }


    /**
     * Get the count of status for DEV issues in TEST
     * issue types: 'Sub-task', 'task', 'technical task','Doc Task'
     */
    getDevIssueCount(data) {
        let devData = data.filter(currentData =>
            arrayContains(DEV_ISSUETYPE_IN_TEST, currentData.issuetype.toLowerCase())
        );

        return devData.length;
    }


    /**
     * Get the count of status for BUG issues in TEST
     * issue types: 'BUG', 'Problem'
     */
    getBugIssueCount(data) {
        let bugData = data.filter(currentData =>
            arrayContains(BUG_ISSUETYPE_IN_TEST, currentData.issuetype.toLowerCase())
        );

        return bugData.length;
    }

    /**
     * Get the query string to get the DEV status based on the module name and the affected version id
     * @param   {String}    moduleName - Module name to filter from the query
     * @param {DOUGHNUT_CHART_MENU_ITEM_ENUM} issueCat
     * @param {TEST_CHART_CAT_ENUM} statusCat
     * @return  {String}    The query string
     */
    getTestQueryString(issueCat, statusCat) {
        let moduleList = [this.props.module];
        if (this.props.module === 'ALL') {
            moduleList = this.props.moduleList;
        }

        //The version number can be represented into two formats. E.g. 2.6 and 2.6.0
        let versionNumber = this.props.versionNumber;
        let fixVersions = getListOfVersionNumbersFromVersion(versionNumber);


        let issueTypes = [];
        if (issueCat === DOUGHNUT_CHART_MENU_ITEM_ENUM.DEV) {
            issueTypes = DEV_ISSUETYPE_IN_TEST;
        }
        else if (issueCat === DOUGHNUT_CHART_MENU_ITEM_ENUM.BUG) {
            issueTypes = BUG_ISSUETYPE_IN_TEST;
        }

        let statusTypes = [];
        if (!statusCat) {
            statusTypes = DONE_STATUS_IN_TEST.concat(REMAINING_STATUS_IN_TEST);
        }
        else if (statusCat === TEST_CHART_CAT_ENUM.DONE) {
            statusTypes = DONE_STATUS_IN_TEST;
        }
        else if (statusCat === TEST_CHART_CAT_ENUM.REMAINING) {
            statusTypes = REMAINING_STATUS_IN_TEST;
        }

        let searchQuery = "project IN ('" + moduleList.join("','") + "') " +
            "AND issuetype IN ('" + issueTypes.join("','") + "') " +
            "AND status IN ('" + statusTypes.join("','") + "') " +
            "AND fixVersion IN ('" + fixVersions.join("','") + "') " ;

        return searchQuery;

    }

    //================================ EVENT HANDLERS ================================//
    /**
     * Event handler when a menu action from the DEV view chart has been triggered
     * The action will redirect to view a JIRA web page corresponding to the chart segment selection.
     * @param {Number}  index of the sector resulting from the chart selection
     * @param {String}  label - The menu item title
     * @param {String}  sector - The sector name (sector label name)
     * @param {String}  scope - scope indicates what part of the chart the menu action has been triggered ("center"
     * of the chart or "sector".
     */
    onTestChartMenuClick(index, label, sector, scope) {

        if (scope === DOUGHNUT_CHART_SCOPE_ENUM.SECTOR) {
            //The menu labels are listed as following:
            //- DEV: <nb of dev count>
            //- BUG: <nb of bug count>
            if (label.startsWith(DOUGHNUT_CHART_MENU_ITEM_ENUM.DEV)) {
                let jqlQuery = this.getTestQueryString(DOUGHNUT_CHART_MENU_ITEM_ENUM.DEV, sector);
                window.open(JIRA_LINK_URL + '?jql=' + jqlQuery, '_blank');
            }
            else if (label.startsWith(DOUGHNUT_CHART_MENU_ITEM_ENUM.BUG)) {
                let jqlQuery = this.getTestQueryString(DOUGHNUT_CHART_MENU_ITEM_ENUM.BUG, sector);
                window.open(JIRA_LINK_URL + '?jql=' + jqlQuery, '_blank');
            }

        }
        else if (scope === DOUGHNUT_CHART_SCOPE_ENUM.CENTER) {
            let jqlQuery = this.getTestQueryString(label);
            window.open(JIRA_LINK_URL + '?jql=' + jqlQuery, '_blank');
        }
    }


    //================================ RENDERING METHODS ================================//



    /**
     * Render the main chart (bug origin)
     */
    renderDevChart() {
        
        let statusChart = (
            <DoughnutChart
                textCenter={this.state.testChartTitle}
                centerFontSize = { 22 }
                numbers={this.state.testChartData}
                percentageView={true}
                tooltip={this.state.testChartLabels}
                arcRadius={50}
                selectedStrokeColor={DOUGHNUT_CHART_HIGHLIGHT_COLOR}
                colorArray={this.state.testChartColorArray}
                menuClick={this.onTestChartMenuClick}
                menu = { this.state.testChartMenu }
                legends = { true }
                legendsData = { this.state.devChartLegendData }
            />

        );

        if (this.state.testChartData && this.state.testChartData.length > 0) {
            return statusChart;
        }
    }


    /**
     * Render the graph
     * @returns {XML}
     */
    render(){


        return (
            <div id={"statusdevview"}>

                <div className="chart-view">
                    {this.renderDevChart()}


                </div>

            </div>

        )
    }
}

export default StatusTest

