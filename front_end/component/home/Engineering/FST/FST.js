/**
 * @prop{Boolean}   : isStatic
 * @prop{Object}    : canvasSize,
 * @prop{Number}    : arcRadius
 * @prop{Boolean}   : disableEngineeringTitle
 * @prop{String}    : rdVersionSelected, should to be renamed at some point.
 */


import {Component} from 'react';
import {
    EngineeringTabEnum,
    STORE_ACTION_ENUM,
    CHART_TITLE_ENUM,
    DOUGHNUT_CHART_SCOPE_ENUM,
    DOUGHNUT_CHART_MENU_ITEM_ENUM,
    DOUGHNUT_CHART_HIGHLIGHT_COLOR,
    JIRA_LINK_URL,
    JQL_RESPONSE_STATUS_ENUM,
    JQL_BUG_ENVIRONMENT_ENUM
} from "../../../../constants/constants";
import {store, storeModule} from "../Store/Store";
import EngineeringTitle from '../EngineeringHeader/EngineeringTitle';
import {
    queryJira,
    generateBackgroundColor,
    getHighlightedColorArray,
    arrayContains,
    getListOfVersionNumbersFromVersion,
    getMenuItems
} from "../CommonFunction";
import DoughnutChart from "../../globals/Charts/DoughnutChart";
import "./FST.less";

/**
 * JQL Query fields used for filtering FST data
 * @type {[string,string,string,string,string,string,string]}
 */
const JQL_FST_FIELDS = [
    'project',
    'status',
    'issuetype',
    'priority',
    'customfield_11600',
    'versions',
    'fixVersions'
];

const BUG_ISSUETYPE = ["BUG", "PROBLEM"];

/**
 * Identify the charts by its order
 * @type {{FIRST: number, SECOND: number, THIRD: number, FOURTH: number}}
 */
const CHART_NB = {
    FIRST: 1,
    SECOND: 2,
    THIRD: 3,
    FOURTH: 4
};


/**
 * @description     : Component to create the FST view with graphs
 */
class FST extends Component {

    /**
     * Build the FST page
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);


        this.onVersionSelect = this.onVersionSelect.bind(this);
        this.onBugOriginChartMenuClick = this.onBugOriginChartMenuClick.bind(this);
        this.onSecondChartMenuClick = this.onSecondChartMenuClick.bind(this);
        this.onThirdChartMenuClick = this.onThirdChartMenuClick.bind(this);
        this.onFourthChartMenuClick = this.onFourthChartMenuClick.bind(this);


        this.fstData = [];      //holds the data for FST
        this.selectedBugOrigin = [];  //current selected bug origin (from the chart)
        this.selectedSecondChartLabel = []; //current selected labels from second chart
        this.displayedSecondChartType = null;  //current displayed second chart type
        this.selectedThirdChartLabel = [];
        this.displayedThirdChartType = null;     //current display third chart type
        this.displayedFourthChartType = null;

        this.modules = [];      //list of all modules available


        this.state = {
            //main chart is always bug origin chart
            boChartTitle: CHART_TITLE_ENUM.BUG_ORIGIN,
            boChartData: [],
            boChartLabels: [],
            boChartMenu: [],
            boChartCenterMenu: [],
            boChartColorArray: [],
            boChartLegendData:[],
            //second chart could be priority, status or module chart
            secondChartTitle: '',
            secondChartData: [],
            secondChartLabels: [],
            secondChartMenu: [],
            secondChartCenterMenu: [],
            secondChartColorArray: [],
            //third chart could be priority, status or module chart
            thirdChartTitle: '',
            thirdChartData: [],
            thirdChartLabels: [],
            thirdChartColorArray: [],
            thirdChartMenu: [],
            thirdChartCenterMenu: [],
            //fourth chart could be priority, status or module chart
            fourthChartTitle: '',
            fourthChartData: [],
            fourthChartLabels: [],
            fourthChartMenu: [],
            fourthChartCenterMenu: [],
            fourthChartColorArray: [],
            isLoading: true, //indicator for data loading progress
        };

        //get the list of all modules available

        let modules = storeModule.getState();
        modules.map((module) => {
            if (module !== 'ALL') {
                this.modules.push(module);
            }
        });



    }

    /**
     * Once the page is mounted, build the graphs data and render
     */
    componentDidMount() {
        document.title = "FST";
        //get the FST state to find the selected module and the selected affected version
        let fstState = this.getFSTState();

        let currentVersionNumber = fstState.versionNumber;

        //check if the parent is asking for a "static" view
        //if it is, then take the version and module coming from the parent component
        if (this.props.isStatic) {
            currentVersionNumber = this.props.rdVersionSelected;
        }

        //get the data for filling up the charts
        this.fetchDataForGraphs(currentVersionNumber, (data) => {

            //save these states before updating the bug origin chart (otherwise, they will be overwritten)
            let previousSelectedBugOrigin = fstState.bugOrigin;
            let previousSecondChartType = fstState.secondChartType;
            let previousSecondChartLabels = fstState.secondChartLabel;
            let previousThirdChartType = fstState.thirdChartType;
            let previousThirdChartLabels = fstState.thirdChartLabel;
            let previousFourthChartType = fstState.fourthChartType;

            this.updateBoChartData(data);

            //(if the parent is asking for a "static" view, don't display all the other charts)
            if (!this.props.isStatic) {
                //display the second chart (status, priority or module) if it was previously displayed
                if (previousSecondChartType === CHART_TITLE_ENUM.STATUS) {
                    this.displayStatusChart(CHART_NB.SECOND, previousSelectedBugOrigin);
                }
                else if (previousSecondChartType === CHART_TITLE_ENUM.PRIORITY) {
                    this.displayPriorityChart(CHART_NB.SECOND, previousSelectedBugOrigin);
                }
                else if (previousSecondChartType === CHART_TITLE_ENUM.MODULE) {
                    this.displayModuleChart(CHART_NB.SECOND, previousSelectedBugOrigin);
                }

                //display the third chart (status, priority or module) if it was previously displayed
                if (previousThirdChartType === CHART_TITLE_ENUM.STATUS) {
                    this.displayStatusChart(CHART_NB.THIRD, previousSelectedBugOrigin, previousSecondChartType,
                        previousSecondChartLabels);
                }
                else if (previousThirdChartType === CHART_TITLE_ENUM.PRIORITY) {
                    this.displayPriorityChart(CHART_NB.THIRD, previousSelectedBugOrigin, previousSecondChartType,
                        previousSecondChartLabels);
                }
                else if (previousThirdChartType === CHART_TITLE_ENUM.MODULE) {
                    this.displayModuleChart(CHART_NB.THIRD, previousSelectedBugOrigin, previousSecondChartType,
                        previousSecondChartLabels, previousThirdChartType, previousThirdChartLabels);
                }

                //display the fourth chart (status, priority or module) if it was previously displayed
                if (previousFourthChartType === CHART_TITLE_ENUM.STATUS) {
                    this.displayStatusChart(CHART_NB.FOURTH, previousSelectedBugOrigin, previousSecondChartType,
                        previousSecondChartLabels, previousThirdChartType, previousThirdChartLabels);
                }
                else if (previousFourthChartType === CHART_TITLE_ENUM.PRIORITY) {
                    this.displayPriorityChart(CHART_NB.FOURTH, previousSelectedBugOrigin, previousSecondChartType,
                        previousSecondChartLabels, previousThirdChartType, previousThirdChartLabels);
                }
                else if (previousFourthChartType === CHART_TITLE_ENUM.MODULE) {
                    this.displayModuleChart(CHART_NB.FOURTH, previousSelectedBugOrigin, previousSecondChartType,
                        previousSecondChartLabels, previousThirdChartType, previousThirdChartLabels);
                }

            }
        });
    }


    /**
     * Called when receiving updates from the parent component.
     * When receiving new props, update with new data for building a new graph.
     * @param nextProps
     */
    componentWillReceiveProps(nextProps){

        //check if the parent is asking for a "static" view
        //if it is, then take the version and module coming from the parent component
        if (nextProps.isStatic) {
            this.setState({isLoading: true});

            let currentVersionNumber = nextProps.rdVersionSelected;
            //get the data for filling up the charts
            this.fetchDataForGraphs(currentVersionNumber, (data) => {
                this.updateBoChartData(data);
            });
        }

    }




    //================================ PRIVATE METHODS ================================//
    /**
     * Get the current state of FST.
     * @return {Object | Store}  Store object represent the FST state.
     */
    getFSTState() {
        let stateStore = store.getState();
        let fstState = stateStore.find(item => item.tabId === EngineeringTabEnum.FST.value);

        return fstState;
    }

    /**
     * Fetch all data of FSTs based on specified modules and versions
     * These data are used as graphs data.
     * @param   {Number}    versionNumber - Version number to filter from the query
     * @param   {Function}  callback - Callback function to be called once data is fetched
     */
    fetchDataForGraphs(versionNumber, callback){

        let bugEnvironment = Object.values(JQL_BUG_ENVIRONMENT_ENUM);

        let searchQuery = this.getQueryString(bugEnvironment, versionNumber);

        let dataForGraphs = [];     //results from the JQL query
        //make the query to jira
        queryJira(searchQuery, JQL_FST_FIELDS, (result) => {

            let jiraResult = JSON.parse(result);

            if (jiraResult.status === JQL_RESPONSE_STATUS_ENUM.FAILED) {
                //there is an error
            }
            else if (jiraResult.status === JQL_RESPONSE_STATUS_ENUM.SUCCESS) {
                let fstResults = jiraResult.results;
                if (fstResults && fstResults.length > 0) {
                    //gather the results and save only the fields we need
                    fstResults.map((fstResult) => {
                        if (fstResult.fields.customfield_11600) {

                            let versions = [];
                            //save the version numbers
                            Object.values(fstResult.fields.versions)
                                .map((version) => {
                                    versions.push(version.name);
                                });


                            let data  = {
                                bugOrigin: fstResult.fields.customfield_11600.value,
                                priority: fstResult.fields.priority.name,
                                status: fstResult.fields.status.name,
                                issuetype: fstResult.fields.issuetype.name,
                                versions: versions,
                                module: fstResult.fields.project.key
                            };

                            dataForGraphs.push(data);
                        }
                    });
                }
            }

            //save a record of this data. we need it to display the charts on demand.
            this.fstData = dataForGraphs;

            if (typeof callback === 'function') {
                /**
                 * callback with an object
                 * @typedef {Object}
                 * @property {String} bugOrigin
                 * @property {String} priority
                 * @property {String} status
                 * @property {String} issuetype
                 * @property {Array | string} versions
                 * @property {String} module
                 */
                callback(dataForGraphs);
            }

        });
    }




    /**
     * Get the bug origin counts for FST
     * @param fstData
     *      @typedef {Object}
     *      @property {String} bugOrigin
     *      @property {String} priority
     *      @property {String} status
     *      @property {String} issuetype
     *      @property {Array | string} versions
     *      @property {String} module
     *
     * @return {Object} An object representing the count of every bug origin category
     *      @property: {String} bug origin category name
     *
     */
    getBugOriginCounts(fstData) {
        //initialize the count object
        let bugOriginCounts = {};
        //get the list of bug origin environments
        let bugOriginEnv = Object.keys(JQL_BUG_ENVIRONMENT_ENUM);

        bugOriginEnv.map( (env) => {
            bugOriginCounts[env.toUpperCase()] = 0;
        });

        //get counts for every bug origin categories
        fstData.reduce((counts, data) => {
            counts[data.bugOrigin.toUpperCase()] ++;
            return counts;
        }, bugOriginCounts);

        return bugOriginCounts;
    }



    /**
     * Get the count of priority for a specific bug origin, status (if specified) and module (if specified)
     * @param {Object} fstData - FST data to filter from
     * @param {String[]} bugOriginList - List of bug origins to filter from the data
     * @param {String[]} statusList - List of priorities to filter from the data
     * @param {String[]} moduleList - List of modules to filter from the data
     * @return {{Object}} Object representing the counts of each type of priority
     */
    getPriorityCounts(fstData, bugOriginList, statusList, moduleList) {
        let priorityCounts = {
        };

        //accumulate the counts of the priorities
        fstData.reduce((pcounts, data) => {

            let addCount = arrayContains(bugOriginList, data.bugOrigin.toUpperCase());

            //filter with status type if specified
            if (statusList) {
                addCount = addCount && arrayContains(statusList, data.status);
            }

            //filter with module type if specified
            if (moduleList) {
                addCount = addCount && arrayContains(moduleList, data.module);
            }


            if (addCount) {
                if (!pcounts[data.priority]) {
                    pcounts[data.priority] = 0;
                }
                pcounts[data.priority]++;
            }
            return pcounts;
        }, priorityCounts);

        return priorityCounts;
    }





    /**
     * Get the count of status for a specific bug origin, priority (if specified) and module (if specified)
     * @param {Object} fstData - FST data to filter from
     * @param {String[]} bugOriginList - List of bug origins to filter from the data
     * @param {String[]} priorityList - List of priorities to filter from the data
     * @param {String[]} moduleList - List of modules to filter from the data
     * @return {{Object}} Object representing the counts of each type of status
     */
    getStatusCounts(fstData, bugOriginList, priorityList, moduleList) {

        let statusCounts = {
        };

        //accumulate the counts of the statuses
        fstData.reduce((scounts, data) => {

            let addCount = arrayContains(bugOriginList, data.bugOrigin.toUpperCase());

            //filter with priority type if specified
            if (priorityList) {
                addCount = addCount && arrayContains(priorityList, data.priority);
            }

            //filter with module type if specified
            if (moduleList) {
                addCount = addCount && arrayContains(moduleList, data.module);
            }


            if (addCount) {
                if (!scounts[data.status]) {
                    scounts[data.status] = 0;
                }
                scounts[data.status]++;
            }
            return scounts;
        }, statusCounts);

        return statusCounts;
    }



    /**
     * Get the count of modules for a specific bug origin, priority (if specified) and status (if specified)
     * @param {Object} fstData - FST data to filter from
     * @param {String[]} bugOriginList - List of bug origins to filter from the data
     * @param {String[]} priorityList - List of priorities to filter from the data
     * @param {String[]} statusList - List of status to filter from the data
     * @return {{Object}} Object representing the counts of each type of module
     */
    getModuleCounts(fstData, bugOriginList, priorityList, statusList) {
        let moduleCounts = {};

        //accumulate the counts of the modules
        fstData.reduce((mcounts, data) => {

            let addCount = arrayContains(bugOriginList, data.bugOrigin.toUpperCase());

            //filter with priority type if specified
            if (priorityList) {
                addCount = addCount && arrayContains(priorityList, data.priority);
            }

            //filter with status type if specified
            if (statusList) {
                addCount = addCount && arrayContains(statusList, data.status);
            }


            if (addCount) {
                if (!mcounts[data.module]) {
                    mcounts[data.module] = 0;
                }
                mcounts[data.module]++;
            }
            return mcounts;
        }, moduleCounts);


        return moduleCounts;

    }

    /**
     * Get the query string to get FST data
     * @param   {String[]}    bugOriginList - list of bug origin name
     * @param   {String}      versionNumber - version number to filter from the query
     * @param   {String[]}    priorityList - list of priority types
     * @param   {String[]}    statusList - list of status types
     * @param   {String[]}    moduleList - list of module types
     * @return  {String}    The query string
     */
    getQueryString(bugOriginList, versionNumber, priorityList, statusList, moduleList) {


        //The version number can be represented into two formats. E.g. 2.6 and 2.6.0
        let affectedVersions = getListOfVersionNumbersFromVersion(versionNumber);

        let searchQuery = "issuetype IN ('" + BUG_ISSUETYPE.join("','") + "') " +
            "AND status != 'DONE' " +
            "AND 'Bug Origin Environment' IN ('" + bugOriginList.join("','") + "') " +
            "AND affectedVersion IN ('" + affectedVersions.join("','") + "') ";


        //add a priority filter if any
        if (priorityList) {
            searchQuery += "AND priority IN ('" + priorityList.join("','") + "') ";
        }

        //add a status filter if any
        if (statusList) {
            searchQuery += "AND status IN ('" + statusList.join("','") + "') ";
        }

        //add a module filter if any
        if (moduleList) {
            searchQuery += "AND project IN  ('" + moduleList.join("','") + "') ";
        }
        else {
            searchQuery += "AND project IN  ('" + this.modules.join("','") + "') ";
        }

        return searchQuery;
    }





    /**
     * Update bug origin chart data
     * @param data - the overall data used to build this view
     * @param callback - Callback after the "setState" is done
     */
    updateBoChartData(data, callback) {
        this.selectedBugOrigin = [];
        this.displayedSecondChartType = null;
        this.displayedThirdChartType = null;
        this.selectedSecondChartLabel = [];
        this.displayedThirdChartType = null;
        this.displayedFourthChartType = null;

        //first store everything
        store.dispatch({
            type: STORE_ACTION_ENUM.FST_UPDATE,
            tabId: EngineeringTabEnum.FST.value,
            bugOrigin: [],
            secondChartType: null,
            secondChartLabel: [],
            thirdChartType: null,
            thirdChartLabel: [],
            fourthChartType: null
        });


        let boCounts = this.getBugOriginCounts(data);
        let boLabels = Object.keys(boCounts);
        let boData = Object.values(boCounts);

        let menuItems =
            getMenuItems(
                [
                    DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA,
                    DOUGHNUT_CHART_MENU_ITEM_ENUM.PRIORITY,
                    DOUGHNUT_CHART_MENU_ITEM_ENUM.STATUS,
                    DOUGHNUT_CHART_MENU_ITEM_ENUM.MODULE
                ]
            );

        let chartMenu = [];
        boLabels.map( (num, index) => {
            chartMenu[index] = menuItems;
        });


        let colorArray = generateBackgroundColor(boData.length);

        //set the legends
        let productionValue = boCounts['PRODUCTION'];
        let stagingValue = boCounts['STAGING'];
        let devValue = boCounts['DEV'];
        let qaValue = boCounts['QA'];
        //Calculate the percentage values for the legends
        //Set the legends name and percentage values. The percentage values represent the fault slip through data.
        let total = productionValue + stagingValue + devValue + qaValue;
        let devPercent = Math.round(((qaValue + stagingValue + productionValue) * 100) / total);
        let qaPercent = Math.round(((productionValue + stagingValue) * 100) / total);
        let stagingPercent = Math.round(((productionValue) * 100) / total);
        let productionPercent = 0;
        let legends = [
            {
                name : JQL_BUG_ENVIRONMENT_ENUM.PRODUCTION,
                percentage :productionPercent,

            },
            {
                name : JQL_BUG_ENVIRONMENT_ENUM.STAGING,
                percentage :stagingPercent,

            },
            {
                name : JQL_BUG_ENVIRONMENT_ENUM.DEV,
                percentage : devPercent,

            },
            {
                name : JQL_BUG_ENVIRONMENT_ENUM.QA,
                percentage :qaPercent

            }
        ];

        //re-render the bug origin chart and reset the other two charts data
        this.setState({
            boChartTitle: CHART_TITLE_ENUM.BUG_ORIGIN,
            boChartData: boData,
            boChartLabels: boLabels,
            boChartMenu: chartMenu,
            boChartCenterMenu: menuItems,
            boChartColorArray: colorArray,
            boChartLegendData: legends,
            secondChartTitle: '',
            secondChartData: [],
            secondChartLabels: [],
            secondChartMenu: [],
            secondChartColorArray: [],
            thirdChartTitle: '',
            thirdChartData: [],
            thirdChartLabels: [],
            thirdChartColorArray: [],
            thirdChartMenu: [],
            fourthChartTitle: '',
            fourthChartData: [],
            fourthChartLabels: [],
            fourthChartMenu: [],
            fourthChartCenterMenu: [],
            fourthChartColorArray: [],
            isLoading: false
        }, callback);
    }

    /**
     * Update second chart data based on the selection of the list of bug origin types
     * @param {{}}    chartData - the data used for the second chart
     * @param {String}    selectedBugOrigins - The list of one of all bug origin types that have been selected
     * @param {String}    chartTitle - The title of the second chart
     * @param {String}    callback - Callback after "setState" is done
     */
    updateSecondChartData(chartData, selectedBugOrigins, chartTitle, callback) {
        this.selectedBugOrigin = selectedBugOrigins;
        this.displayedSecondChartType = chartTitle;
        this.selectedSecondChartLabel = [];
        this.displayedThirdChartType = null;
        this.displayedFourthChartType = null;

        //first store everything to remember if we need to switch back to this view
        store.dispatch({
            type: STORE_ACTION_ENUM.FST_UPDATE,
            tabId: EngineeringTabEnum.FST.value,
            bugOrigin: selectedBugOrigins,
            secondChartType: chartTitle,
            secondChartLabel: [],
            thirdChartType: null,
            thirdChartLabel: [],
            fourthChartType: null
        });


        let data = Object.values(chartData);
        let labels = Object.keys(chartData);
        let chartColorArray = generateBackgroundColor(data.length);

        //define the last menu item
        let menuList = [];
        if (chartTitle === CHART_TITLE_ENUM.STATUS) {
            menuList = [
                DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.PRIORITY,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.MODULE
            ];
        }
        else if (chartTitle === CHART_TITLE_ENUM.PRIORITY) {
            menuList = [
                DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.STATUS,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.MODULE
            ];
        }
        else if (chartTitle === CHART_TITLE_ENUM.MODULE) {
            menuList = [
                DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.PRIORITY,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.STATUS
            ];
        }

        //and get the whole list to render
        let menuItems =
            getMenuItems(menuList);

        let chartMenu = [];
        labels.map( (num, index) => {
            chartMenu[index] = menuItems;
        });


        //highlight a segment in the bug origin chart and display the priority chart
        let colorArray = getHighlightedColorArray(this.state.boChartLabels, selectedBugOrigins);

        this.setState({
            boChartColorArray: colorArray,
            secondChartTitle: chartTitle,
            secondChartData: data,
            secondChartLabels: labels,
            secondChartMenu: chartMenu,
            secondChartCenterMenu: menuItems,
            secondChartColorArray: chartColorArray,
            thirdChartTitle: '',
            thirdChartData: [],
            thirdChartLabels: [],
            thirdChartColorArray: [],
            thirdChartMenu: [],
            fourthChartData: [],
            fourthChartLabels: [],
            fourthChartMenu: [],
            fourthChartCenterMenu: [],
            fourthChartColorArray: [],
            isLoading: false
        }, callback);
    }


    /**
     * Update third chart data based on the selection of the list of bug origin types and the second chart label
     * @param chartData - The data used to build the third chart
     * @param selectedBugOrigins - The selected bug origins
     * @param selectedLabels - The selected labels on the third chart
     * @param chartTitle - The title of the third chart
     * @param callback - Callback after the "setState" is done
     */
    updateThirdChartData(chartData, selectedBugOrigins, selectedLabels, chartTitle, callback) {
        this.selectedSecondChartLabel = selectedLabels;
        this.displayedThirdChartType = chartTitle;
        this.selectedThirdChartLabel = [];
        this.displayedFourthChartType = null;


        store.dispatch({
            type: STORE_ACTION_ENUM.FST_UPDATE,
            tabId: EngineeringTabEnum.FST.value,
            bugOrigin: selectedBugOrigins,
            secondChartType: this.displayedSecondChartType,
            secondChartLabel: selectedLabels,
            thirdChartType: chartTitle,
            thirdChartLabel: [],
            fourthChartType: null
        });



        let data = Object.values(chartData);
        let labels = Object.keys(chartData);
        let chartColorArray = generateBackgroundColor(data.length);

        let menuList = [];
        if (chartTitle === CHART_TITLE_ENUM.STATUS && this.displayedSecondChartType === CHART_TITLE_ENUM.PRIORITY) {

            menuList = [
                DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.MODULE
            ];
        }
        if (chartTitle === CHART_TITLE_ENUM.STATUS && this.displayedSecondChartType === CHART_TITLE_ENUM.MODULE) {

            menuList = [
                DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.PRIORITY
            ];
        }
        else if (chartTitle === CHART_TITLE_ENUM.PRIORITY && this.displayedSecondChartType === CHART_TITLE_ENUM.STATUS) {
            menuList = [
                DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.MODULE
            ];
        }
        else if (chartTitle === CHART_TITLE_ENUM.PRIORITY && this.displayedSecondChartType === CHART_TITLE_ENUM.MODULE) {
            menuList = [
                DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.STATUS,
            ];
        }
        else if (chartTitle === CHART_TITLE_ENUM.MODULE && this.displayedSecondChartType === CHART_TITLE_ENUM.STATUS) {
            menuList = [
                DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.PRIORITY,
            ];
        }
        else if (chartTitle === CHART_TITLE_ENUM.MODULE && this.displayedSecondChartType === CHART_TITLE_ENUM.PRIORITY) {
            menuList = [
                DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA,
                DOUGHNUT_CHART_MENU_ITEM_ENUM.STATUS
            ];
        }

        let menuItems = getMenuItems(menuList);
        let chartMenu = [];
        labels.map( (num, index) => {
            chartMenu[index] = menuItems;
        });

        //highlight a (or all) segment in the bug origin chart
        let boColorArray = getHighlightedColorArray(this.state.boChartLabels, selectedBugOrigins);
        //highlight a (or all) segment in the second chart
        let secondColorArray = getHighlightedColorArray(this.state.secondChartLabels, selectedLabels);

        this.setState({
            boChartColorArray: boColorArray,
            secondChartColorArray: secondColorArray,
            thirdChartTitle: chartTitle,
            thirdChartData: data,
            thirdChartMenu: chartMenu,
            thirdChartCenterMenu: menuItems,
            thirdChartLabels: labels,
            thirdChartColorArray: chartColorArray,
            fourthChartTitle: '',
            fourthChartData: [],
            fourthChartLabels: [],
            fourthChartMenu: [],
            fourthChartCenterMenu: [],
            fourthChartColorArray: [],
            isLoading: false
        }, callback);
    }

    /**
     * Update fourth chart data based on the selection of the list of bug origin types, the selection from the second
     * chart and the selection from the third chart
     *
     * @param chartData - The data used to build the third chart
     * @param selectedBugOrigins - The selected bug origins
     * @param secondChartSelection - The selected labels from the second chart
     * @param thirdChartSelection - The selected labels from the third chart
     * @param chartTitle - The title of the third chart
     * @param callback - Callback after the "setState" is done
     */
    updateFourthChartData(chartData, selectedBugOrigins, secondChartSelection, thirdChartSelection,
                          chartTitle, callback) {
        this.selectedThirdChartLabel = thirdChartSelection;
        this.displayedFourthChartType = chartTitle;

        store.dispatch({
            type: STORE_ACTION_ENUM.FST_UPDATE,
            tabId: EngineeringTabEnum.FST.value,
            bugOrigin: selectedBugOrigins,
            secondChartType: this.displayedSecondChartType,
            secondChartLabel: secondChartSelection,
            thirdChartType: this.displayedThirdChartType,
            thirdChartLabel: thirdChartSelection,
            fourthChartType: chartTitle
        });


        let data = Object.values(chartData);
        let labels = Object.keys(chartData);
        let chartColorArray = generateBackgroundColor(data.length);

        let menuList = [];
        if (chartTitle === CHART_TITLE_ENUM.STATUS) {
            menuList = [DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA];
        }
        else if (chartTitle === CHART_TITLE_ENUM.PRIORITY) {
            menuList = [DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA];        }
        else if (chartTitle === CHART_TITLE_ENUM.MODULE) {
            menuList = [DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA];        }

        let menuItems = getMenuItems(menuList);
        let chartMenu = [];
        labels.map( (num, index) => {
            chartMenu[index] = menuItems;
        });


        //highlight a (or all) segment in the bug origin chart
        let boColorArray = getHighlightedColorArray(this.state.boChartLabels, selectedBugOrigins);
        //highlight a (or all) segment in the second chart
        let secondChartColorArray = getHighlightedColorArray(this.state.secondChartLabels, secondChartSelection);
        //highlight a (or all) segment in the third chart
        let thirdChartColorArray = getHighlightedColorArray(this.state.thirdChartLabels, thirdChartSelection);

        this.setState({
            boChartColorArray: boColorArray,
            secondChartColorArray: secondChartColorArray,
            thirdChartColorArray: thirdChartColorArray,
            fourthChartTitle: chartTitle,
            fourthChartData: data,
            fourthChartLabels: labels,
            fourthChartMenu: chartMenu,
            fourthChartCenterMenu: menuItems,
            fourthChartColorArray: chartColorArray,
            isLoading: false
        }, callback);
    }


    /**
     * Handle the creation of the JIRA link and action according to the selection made in the charts.
     * @param {String[]}                        bugOriginList - List of selected bug origin types
     * @param {String | CHART_TITLE_ENUM}       secondChart   - Type of the second chart
     * @param {String[]}                        secondChartSelection - List of selected elements in the second chart
     * @param {String | CHART_TITLE_ENUM}       thirdChart - Type of the third chart
     * @param {String[]}                        thirdChartSelection - List of selected elements in the third chart
     * @param {String | CHART_TITLE_ENUM}       fourthChart - Type of the fourth chart
     * @param {String[]}                        fourthChartSelection - List of selected elements in the fourth chart
     */
    handleJiraLink(bugOriginList,
                   secondChart, secondChartSelection,
                   thirdChart, thirdChartSelection,
                   fourthChart, fourthChartSelection) {
        let priorityList = null;
        let statusList = null;
        let moduleList = null;

        if (secondChart) {
            if (secondChart  === CHART_TITLE_ENUM.PRIORITY) {
                priorityList = secondChartSelection;
            }
            else if (secondChart === CHART_TITLE_ENUM.STATUS) {
                statusList = secondChartSelection;
            }
            else if (secondChart === CHART_TITLE_ENUM.MODULE) {
                moduleList = secondChartSelection;
            }
        }

        if (thirdChart) {
            if (thirdChart  === CHART_TITLE_ENUM.PRIORITY) {
                priorityList = thirdChartSelection;
            }
            else if (thirdChart === CHART_TITLE_ENUM.STATUS) {
                statusList = thirdChartSelection;
            }
            else if (thirdChart === CHART_TITLE_ENUM.MODULE) {
                moduleList = thirdChartSelection;
            }
        }

        if (fourthChart) {
            if (fourthChart  === CHART_TITLE_ENUM.PRIORITY) {
                priorityList = fourthChartSelection;
            }
            else if (fourthChart === CHART_TITLE_ENUM.STATUS) {
                statusList = fourthChartSelection;
            }
            else if (fourthChart === CHART_TITLE_ENUM.MODULE) {
                moduleList = fourthChartSelection;
            }
        }

        let fstState = this.getFSTState();
        let jqlQuery = this.getQueryString(bugOriginList, fstState.versionNumber, priorityList, statusList, moduleList);
        window.open(JIRA_LINK_URL + '?jql=' + jqlQuery, '_blank');

    }

    /**
     * Display the priority chart on the specified chart nb (in the layout)
     * @param {Number | CHART_NB}               chartNb  - Chart nb (in the UI layout) to update
     * @param {String[]}                        bugOriginList - List of selected bug origin types
     * @param {String | CHART_TITLE_ENUM}       secondChart   - Type of the second chart
     * @param {String[]}                        secondChartSelection - List of selected elements in the second chart
     * @param {String | CHART_TITLE_ENUM}       thirdChart - Type of the third chart
     * @param {String[]}                        thirdChartSelection - List of selected elements in the third chart
     * @param {String | CHART_TITLE_ENUM}       fourthChart - Type of the fourth chart
     * @param {String[]}                        fourthChartSelection - List of selected elements in the fourth chart
     */
    displayPriorityChart(chartNb, bugOriginList,
                         secondChart, secondChartSelection,
                         thirdChart, thirdChartSelection,
                         fourthChart, fourthChartSelection) {

        let statusList = null;
        let moduleList = null;


        if (secondChart) {
            if (secondChart  === CHART_TITLE_ENUM.STATUS) {
                statusList = secondChartSelection;
            }
            else if (secondChart === CHART_TITLE_ENUM.MODULE) {
                moduleList = secondChartSelection;
            }

        }

        if (thirdChart) {
            if (thirdChart  === CHART_TITLE_ENUM.STATUS) {
                statusList = thirdChartSelection;
            }
            else if (thirdChart === CHART_TITLE_ENUM.MODULE) {
                moduleList = thirdChartSelection;
            }
        }

        if (fourthChart) {
            if (fourthChart  === CHART_TITLE_ENUM.STATUS) {
                statusList = fourthChartSelection;
            }
            else if (fourthChart === CHART_TITLE_ENUM.MODULE) {
                moduleList = fourthChartSelection;
            }
        }

        let priorityData = this.getPriorityCounts(this.fstData, bugOriginList,
            statusList, moduleList);

        if (chartNb === CHART_NB.SECOND) {
            this.updateSecondChartData(priorityData, bugOriginList, CHART_TITLE_ENUM.PRIORITY);

        }
        else if (chartNb === CHART_NB.THIRD) {
            this.updateThirdChartData(priorityData, bugOriginList, secondChartSelection, CHART_TITLE_ENUM.PRIORITY);
        }
        else if (chartNb === CHART_NB.FOURTH) {
            this.updateFourthChartData(priorityData, bugOriginList,
                secondChartSelection, thirdChartSelection,
                CHART_TITLE_ENUM.PRIORITY);
        }

    }

    /**
     * Display the status chart on the specified chart nb (in the layout)
     * @param {Number | CHART_NB}               chartNb  - Chart nb (in the UI layout) to update
     * @param {String[]}                        bugOriginList - List of selected bug origin types
     * @param {String | CHART_TITLE_ENUM}       secondChart   - Type of the second chart
     * @param {String[]}                        secondChartSelection - List of selected elements in the second chart
     * @param {String | CHART_TITLE_ENUM}       thirdChart - Type of the third chart
     * @param {String[]}                        thirdChartSelection - List of selected elements in the third chart
     * @param {String | CHART_TITLE_ENUM}       fourthChart - Type of the fourth chart
     * @param {String[]}                        fourthChartSelection - List of selected elements in the fourth chart
     */
    displayStatusChart(chartNb, bugOriginList,
                       secondChart, secondChartSelection,
                       thirdChart, thirdChartSelection,
                       fourthChart, fourthChartSelection) {

        let priorityList = null;
        let moduleList = null;


        if (secondChart) {
            if (secondChart  === CHART_TITLE_ENUM.PRIORITY) {
                priorityList = secondChartSelection;
            }
            else if (secondChart === CHART_TITLE_ENUM.MODULE) {
                moduleList = secondChartSelection;
            }

        }

        if (thirdChart) {
            if (thirdChart  === CHART_TITLE_ENUM.PRIORITY) {
                priorityList = thirdChartSelection;
            }
            else if (thirdChart === CHART_TITLE_ENUM.MODULE) {
                moduleList = thirdChartSelection;
            }
        }

        if (fourthChart) {
            if (fourthChart  === CHART_TITLE_ENUM.PRIORITY) {
                priorityList = fourthChartSelection;
            }
            else if (fourthChart === CHART_TITLE_ENUM.MODULE) {
                moduleList = fourthChartSelection;
            }
        }

        let statusData = this.getStatusCounts(this.fstData, bugOriginList,
            priorityList, moduleList);

        if (chartNb === CHART_NB.SECOND) {
            this.updateSecondChartData(statusData, bugOriginList, CHART_TITLE_ENUM.STATUS);

        }
        else if (chartNb === CHART_NB.THIRD) {
            this.updateThirdChartData(statusData, bugOriginList, secondChartSelection, CHART_TITLE_ENUM.STATUS);
        }
        else if (chartNb === CHART_NB.FOURTH) {
            this.updateFourthChartData(statusData, bugOriginList,
                secondChartSelection, thirdChartSelection,
                CHART_TITLE_ENUM.STATUS);
        }

    }



    /**
     * Display the module chart on the specified chart nb (in the layout)
     * @param {Number | CHART_NB}               chartNb  - Chart nb (in the UI layout) to update
     * @param {String[]}                        bugOriginList - List of selected bug origin types
     * @param {String | CHART_TITLE_ENUM}       secondChart   - Type of the second chart
     * @param {String[]}                        secondChartSelection - List of selected elements in the second chart
     * @param {String | CHART_TITLE_ENUM}       thirdChart - Type of the third chart
     * @param {String[]}                        thirdChartSelection - List of selected elements in the third chart
     * @param {String | CHART_TITLE_ENUM}       fourthChart - Type of the fourth chart
     * @param {String[]}                        fourthChartSelection - List of selected elements in the fourth chart
     */
    displayModuleChart(chartNb, bugOriginList,
                       secondChart, secondChartSelection,
                       thirdChart, thirdChartSelection,
                       fourthChart, fourthChartSelection) {

        let priorityList = null;
        let statusList = null;


        if (secondChart) {
            if (secondChart  === CHART_TITLE_ENUM.PRIORITY) {
                priorityList = secondChartSelection;
            }
            else if (secondChart === CHART_TITLE_ENUM.STATUS) {
                statusList = secondChartSelection;
            }

        }

        if (thirdChart) {
            if (thirdChart  === CHART_TITLE_ENUM.PRIORITY) {
                priorityList = thirdChartSelection;
            }
            else if (thirdChart === CHART_TITLE_ENUM.STATUS) {
                statusList = thirdChartSelection;
            }
        }

        if (fourthChart) {
            if (fourthChart  === CHART_TITLE_ENUM.PRIORITY) {
                priorityList = fourthChartSelection;
            }
            else if (fourthChart === CHART_TITLE_ENUM.STATUS) {
                statusList = fourthChartSelection;
            }
        }

        let moduleData = this.getModuleCounts(this.fstData, bugOriginList,
            priorityList, statusList);

        if (chartNb === CHART_NB.SECOND) {
            this.updateSecondChartData(moduleData, bugOriginList, CHART_TITLE_ENUM.MODULE);

        }
        else if (chartNb === CHART_NB.THIRD) {
            this.updateThirdChartData(moduleData, bugOriginList, secondChartSelection, CHART_TITLE_ENUM.MODULE);
        }
        else if (chartNb === CHART_NB.FOURTH) {
            this.updateFourthChartData(moduleData, bugOriginList,
                secondChartSelection, thirdChartSelection,
                CHART_TITLE_ENUM.MODULE);
        }

    }

    //================================ EVENT HANDLERS ================================//

    /**
     * Event handler triggered when a new selection on the version dropdown list has been made.
     * @param   {Number}    version - The newly selected version id
     */
    onVersionSelect(version) {
        this.setState({isLoading: true});

        //get the FST state to find the selected module and the selected affected version
        let fstState = this.getFSTState();

        //update the data for the graphs based on the newly selected version id
        this.fetchDataForGraphs(fstState.versionNumber, (data) => {
            this.updateBoChartData(data);

        });

    }


    /**
     * Callback method triggered when a selection in the year dropdown list has been changed.
     * @param e - The event object resulted from the selection change
     */
    onYearSelect(e) {
        this.setState({isLoading: true});

        //get the FST state to find the selected module and the selected affected version
        let fstState = this.getFSTState();

        //update the data for the graphs based on the newly selected version id
        this.fetchDataForGraphs(fstState.versionNumber, (data) => {
            this.updateBoChartData(data);

        });
    }


    /**
     * Event handler when a menu action from the bug origin chart has been triggered
     * From that action, either we can display an addition chart (Priority chart or Status chart) or
     * redirect to view a JIRA web page corresponding to the selection.
     * @param {Number}  index of the sector resulting from the bug origin chart selection
     * @param {String}  label - The menu item title
     * @param {String}  sector - The sector name (sector label name)
     * @param {String}  scope - scope indicates what part of the chart the menu action has been triggered ("center"
     * of the chart or "sector".
     */
    onBugOriginChartMenuClick(index, label, sector, scope) {

        //find the bug origin category from the chart
        let bugOriginList = [];
        //has the user clicked on "VIEW ALL" or on a specific sector of the chart?
        if (scope === DOUGHNUT_CHART_SCOPE_ENUM.SECTOR) {
            bugOriginList = [sector];
        }
        else if (scope === DOUGHNUT_CHART_SCOPE_ENUM.CENTER) {
            bugOriginList = this.state.boChartLabels;
        }

        //get the data and render them in the second chart
        if (bugOriginList.length > 0) {
            if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.PRIORITY) {
                this.displayPriorityChart(CHART_NB.SECOND, bugOriginList);
            }
            else if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.STATUS) {
                this.displayStatusChart(CHART_NB.SECOND, bugOriginList);
            }
            else if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.MODULE) {
                this.displayModuleChart(CHART_NB.SECOND, bugOriginList);
            }

            //in the case a JIRA LINK has been selected, direct to that link
            else if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA) {
                this.handleJiraLink(bugOriginList);
            }
        }

    }

    /**
     * Event handler when a menu action from the second chart has been triggered.
     * From that action, either we can display an addition chart  or
     * redirect to view a JIRA web page corresponding to the selection.
     * @param {Number}  index of the sector resulting from the second chart selection
     * @param {String}  label - The menu item title
     * @param {String}  sector - The sector name (sector label name)
     * @param {String}  scope - scope indicates what part of the chart the menu action has been triggered ("center"
     * of the chart or "sector".
     */
    onSecondChartMenuClick(index, label, sector, scope) {
        //find the category from the chart
        let selectionList = [];
        //has the user clicked on "VIEW ALL" or on a specific sector of the chart?
        if (scope === DOUGHNUT_CHART_SCOPE_ENUM.SECTOR) {
            selectionList = [sector];
        }
        else if (scope === DOUGHNUT_CHART_SCOPE_ENUM.CENTER) {
            selectionList = this.state.secondChartLabels;
        }

        if (selectionList.length > 0) {
            //get the data and render them in the second chart
            //are we displaying a new STATUS chart?
            if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.STATUS) {
                this.displayStatusChart(CHART_NB.THIRD,
                    this.selectedBugOrigin, this.displayedSecondChartType, selectionList);
            }
            //are we displaying a new PRIORITY chart?
            else if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.PRIORITY) {
                this.displayPriorityChart(CHART_NB.THIRD,
                    this.selectedBugOrigin, this.displayedSecondChartType, selectionList);

            }
            //are we displaying a new MODULE chart?
            else if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.MODULE) {
                this.displayModuleChart(CHART_NB.THIRD,
                    this.selectedBugOrigin, this.displayedSecondChartType, selectionList);
            }
            //in the case a JIRA LINK has been selected, direct to that link
            else if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA) {

                this.handleJiraLink(this.selectedBugOrigin, this.displayedSecondChartType, selectionList);

            }
        }
    }

    /**
     * Event handler when a menu action from the third chart has been triggered.
     * The action redirects to view a JIRA web page corresponding to the selection.
     * @param {Number}  index of the sector resulting from the third chart selection
     * @param {String}  label - The menu item title
     * @param {String}  sector - The sector name (sector label name)
     * @param {String}  scope - scope indicates what part of the chart the menu action has been triggered ("center"
     * of the chart or "sector".
     */
    onThirdChartMenuClick(index, label, sector, scope) {
        //find the category from the chart
        let selectionList = [];
        //has the user clicked on "VIEW ALL" or on a specific sector of the chart?
        if (scope === DOUGHNUT_CHART_SCOPE_ENUM.SECTOR) {
            selectionList = [sector];
        }
        else if (scope === DOUGHNUT_CHART_SCOPE_ENUM.CENTER) {
            selectionList = this.state.thirdChartLabels;
        }

        if (selectionList.length > 0) {
            if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA) {

                this.handleJiraLink(this.selectedBugOrigin,
                    this.displayedSecondChartType, this.selectedSecondChartLabel,
                    this.displayedThirdChartType, selectionList
                );


            }
            else if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.PRIORITY) {
                this.displayPriorityChart(CHART_NB.FOURTH,
                    this.selectedBugOrigin,
                    this.displayedSecondChartType, this.selectedSecondChartLabel,
                    this.displayedThirdChartType, selectionList);
            }
            else if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.STATUS) {
                this.displayStatusChart(CHART_NB.FOURTH,
                    this.selectedBugOrigin,
                    this.displayedSecondChartType, this.selectedSecondChartLabel,
                    this.displayedThirdChartType, selectionList);
            }
            else if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.MODULE) {
                this.displayModuleChart(CHART_NB.FOURTH,
                    this.selectedBugOrigin,
                    this.displayedSecondChartType, this.selectedSecondChartLabel,
                    this.displayedThirdChartType, selectionList);
            }

        }
    }


    /**
     * Event handler when a menu action from the fourth chart has been triggered.
     * The action redirects to view a JIRA web page corresponding to the selection.
     * @param {Number}  index of the sector resulting from the fourth chart selection
     * @param {String}  label - The menu item title
     * @param {String}  sector - The sector name (sector label name)
     * @param {String}  scope - scope indicates what part of the chart the menu action has been triggered ("center"
     * of the chart or "sector".
     */
    onFourthChartMenuClick(index, label, sector, scope) {
        let selectionList = [];
        //has the user clicked on "VIEW ALL" or on a specific sector of the chart?
        if (scope === DOUGHNUT_CHART_SCOPE_ENUM.SECTOR) {
            selectionList = [sector];
        }
        else if (scope === DOUGHNUT_CHART_SCOPE_ENUM.CENTER) {
            selectionList = this.state.fourthChartLabels;
        }

        if (selectionList.length > 0) {
            if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA) {

                this.handleJiraLink(this.selectedBugOrigin,
                    this.displayedSecondChartType, this.selectedSecondChartLabel,
                    this.displayedThirdChartType, this.selectedThirdChartLabel,
                    this.displayedFourthChartType, selectionList
                );


            }
        }

    }


    //================================ RENDERING METHODS ================================//



    /**
     * Render the loading icon to indicate "data loading is in progress"
     * @return {XML}
     */
    renderLoadingIcon() {
        if (this.state.isLoading) {
            return (
                <div className="loader"></div>
            );
        }
    }


    /**
     * Render the main chart (bug origin)
     */
    renderMainChart() {


        let mainChart = (
            <DoughnutChart
                textCenter={this.state.boChartTitle}
                centerFontSize = {this.props.centerFontSize ? this.props.centerFontSize : null}
                numbers={this.state.boChartData}
                tooltip={this.state.boChartLabels}
                arcRadius={this.props.arcRadius ? this.props.arcRadius :  50}
                canvasSize={ this.props.canvasSize ? this.props.canvasSize : null }
                selectedStrokeColor={DOUGHNUT_CHART_HIGHLIGHT_COLOR}
                colorArray={this.state.boChartColorArray}
                menuClick={this.onBugOriginChartMenuClick}
                menu = { !this.props.isStatic ? this.state.boChartMenu : null }
                centerMenu = { !this.props.isStatic ? this.state.boChartCenterMenu : null }
                sectorSelectionDisabled = { this.props.isStatic }
                legends = { true }
                legendsData = { this.state.boChartLegendData }
            />
        );

        if (!this.state.isLoading && this.state.boChartData && this.state.boChartData.length > 0) {
            return mainChart;
        }
    }

    /**
     * Render the second chart
     */
    renderSecondChart() {


        let secondChart = (
            <DoughnutChart
                textCenter={this.state.secondChartTitle}
                numbers={this.state.secondChartData}
                tooltip={this.state.secondChartLabels}
                arcRadius={50}
                selectedStrokeColor={DOUGHNUT_CHART_HIGHLIGHT_COLOR}
                colorArray={this.state.secondChartColorArray}
                menuClick={this.onSecondChartMenuClick}
                menu = { this.state.secondChartMenu }
                centerMenu = {this.state.secondChartCenterMenu}
                legends = { true }
            />
        );

        if (!this.state.isLoading && this.state.secondChartData && this.state.secondChartData.length > 0) {
            return secondChart;
        }

    }

    /**
     * Render the third chart
     */
    renderThirdChart() {
        let lastChart = (
            <DoughnutChart
                textCenter={this.state.thirdChartTitle}
                numbers={this.state.thirdChartData}
                tooltip={this.state.thirdChartLabels}
                arcRadius={50}
                selectedStrokeColor={DOUGHNUT_CHART_HIGHLIGHT_COLOR}
                colorArray={this.state.thirdChartColorArray}
                menuClick={this.onThirdChartMenuClick}
                menu = { this.state.thirdChartMenu }
                centerMenu = {this.state.thirdChartCenterMenu}
                legends = { true }
            />
        );

        if (!this.state.isLoading && this.state.thirdChartData && this.state.thirdChartData.length > 0) {
            return lastChart;
        }

    }

    /**
     * Render the third chart
     */
    renderFourthChart() {
        let fourthChart = (
            <DoughnutChart
                textCenter={this.state.fourthChartTitle}
                numbers={this.state.fourthChartData}
                tooltip={this.state.fourthChartLabels}
                arcRadius={50}
                selectedStrokeColor={DOUGHNUT_CHART_HIGHLIGHT_COLOR}
                colorArray={this.state.fourthChartColorArray}
                menuClick={this.onFourthChartMenuClick}
                menu = { this.state.fourthChartMenu }
                centerMenu = {this.state.fourthChartCenterMenu}
                legends = { true }
            />
        );

        if (!this.state.isLoading && this.state.fourthChartData && this.state.fourthChartData.length > 0) {
            return fourthChart;
        }

    }

    /**
     * Render the engineering menu bar with dropdown lists
     */
    renderEngineeringTitle() {
        let engineeringTitle = (
            <EngineeringTitle
                title={"FST"}
                engineeringTabId={EngineeringTabEnum.FST.value}
                onVersionSelectCallback={this.onVersionSelect}
                onModuleSelectCallback={this.onModuleSelect}
            />
        );

        if (!this.props.disableEngineeringTitle) {
            return engineeringTitle;
        }
    }

    /**
     * Render the "PRIORITY" and "STATUS" graphs of FST.
     * @returns {XML}
     */
    render(){


        return (
            <div id={"fstpage"} className="row">


                {this.renderEngineeringTitle()}

                {this.renderLoadingIcon()}

                <div className="chart-view">
                    {this.renderMainChart()}

                    {this.renderSecondChart()}

                    {this.renderThirdChart()}

                    {this.renderFourthChart()}
                </div>

            </div>

        )
    }
}

export default FST

