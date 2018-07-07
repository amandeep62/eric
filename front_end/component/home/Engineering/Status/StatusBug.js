/**
 * @prop{Boolean}   : isStatic
 * @prop{Object}    : canvasSize,
 * @prop{Number}    : arcRadius
 * @prop{Boolean}   : disableEngineeringTitle
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
} from "../../../../constants/constants";
import {store, storeModule} from "../Store/Store";
import {
    generateBackgroundColor,
    getHighlightedColorArray,
    arrayContains,
    getListOfVersionNumbersFromVersion,
    getMenuItems
} from "../CommonFunction";
import DoughnutChart from "../../globals/Charts/DoughnutChart";
import "./status.less";

/**
 * Identify the charts by its order
 * @type {{FIRST: number, SECOND: number, THIRD: number, FOURTH: number}}
 */
const CHART_NB = {
    FIRST: 1,
    SECOND: 2,
    THIRD: 3
};

/**
 * @description     : Component to create the Status BUG view with graphs
 */
class StatusBug extends Component {

    /**
     * Build the Status BUG view page
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);

        this.onStatusChartMenuClick = this.onStatusChartMenuClick.bind(this);
        this.onPriorityChartMenuClick = this.onPriorityChartMenuClick.bind(this);
        this.onThirdChartMenuClick = this.onThirdChartMenuClick.bind(this);


        this.modules = [];  //list of all modules available
        this.bugStatusData = [];    //data that holds all information on the bug status
        this.bugPriorityData = []; //data that holds all information on the bug priorities and related information.
        this.selectedPriority = []; //current selected priority from the chart
        this.displayThirdChartType = null; //current display last chart type (needed to keep track on the menu handle)


        this.state = {
            //first chart is always bug status chart
            statusChartTitle: CHART_TITLE_ENUM.STATUS,
            statusChartData: [],
            statusChartLabels: [],
            statusChartMenu: [],
            statusChartCenterMenu: [],
            statusChartColorArray: [],
            //center chart is priority chart
            priorityChartTitle: CHART_TITLE_ENUM.PRIORITY,
            priorityChartData: [],
            priorityChartLabels: [],
            priorityChartMenu: [],
            priorityChartCenterMenu: [],
            priorityChartColorArray: [],
            //third chart could be status, fix version or module chart
            thirdChartTitle: '',
            thirdChartData: [],
            thirdChartLabels: [],
            thirdChartColorArray: [],
            thirdChartMenu: [],
            thirdChartCenterMenu: [],
            isLoading: true //indicator for data loading progress
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
     * Wait until everything is mounted before rendering the chart data
     */
    componentDidMount() {
        this.bugStatusData = this.props.bugChatData;
        this.bugPriorityData = this.props.chartData;

        let statusState = this.getStatusState();

        //make sure that we are in the Status Tab and not an external component asking for a "static" view

        if (!this.props.isStatic) {

            //update with the latest version before doing anything else.
            //if there are changes in the version and the module, that means that we are receiving new chart data
            if (this.getStatusState().bugCurrentVersion !== this.props.version) {
                store.dispatch({
                    type: STORE_ACTION_ENUM.BUG_STATUS_UPDATE,
                    tabId: EngineeringTabEnum.STATUS.value,
                    bugPriority: [],
                    lastChartType: null,
                    thirdChartType: null,
                    bugCurrentVersion: this.props.version,
                });
            }
        }


        //save these states before updating the charts data (otherwise, they will be overwritten)
        let previousBugPriority = statusState.bugPriority;
        let previousLastChartType = statusState.lastChartType;

        this.updateStatusChartData(this.props.statusChartData, () => {
            //wait for the callback (setState is asynchronous and we needed it before updating the last chart)

            //if the parent is asking for a "static" view, don't display all the other charts
            if (!this.props.isStatic) {
                this.updatePriorityChartData(this.props.chartData, () => {
                    //if the last chart was previously displayed, then display it again
                    if (previousLastChartType) {
                        let lastData = [];
                        if (previousLastChartType === CHART_TITLE_ENUM.STATUS) {
                            lastData = this.getStatusCounts(this.bugPriorityData, previousBugPriority);
                        }
                        else if (previousLastChartType === CHART_TITLE_ENUM.MODULE) {
                            lastData = this.getModuleCounts(this.bugPriorityData, previousBugPriority);
                        }
                        else if (previousLastChartType === CHART_TITLE_ENUM.FIX_VERSION) {
                            lastData = this.getFixVersionCounts(this.bugPriorityData, previousBugPriority);
                        }

                        this.updateThirdChartData(lastData, previousBugPriority, previousLastChartType);

                    }

                });

            }
        });
    }


    /**
     * Will receive updates on the new chart data  (with the new selected version or module).
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        this.bugPriorityData = nextProps.chartData;
        //reset the view and update the status & priority charts data and re-render
        this.updateStatusChartData(nextProps.statusChartData, () => {
            this.updatePriorityChartData(nextProps.chartData);
        });
    }


    //================================ PRIVATE METHODS ================================//


    /**
     * Get the current state of status tab.
     * @return {Object | Store}  Store object represent the status state.
     */
    getStatusState() {
        let statusStore = store.getState();
        let statusState = statusStore.find(item => item.tabId === EngineeringTabEnum.STATUS.value);

        return statusState;
    }


    /**
     * Get the bug status counts
     * @param {Object[]} bugData - contains all bug data for building the charts in this view
     * @return {Object} An object representing the count of every status category
     *      @property: {String} status category name
     *
     */
    getBugStatusCounts(bugData) {
        //initialize the count object
        let statusCounts = {};

        //accumulate the counts to find all the statuses with the specified bugOriginList
        bugData.reduce((scounts, data) => {
            if (!scounts[data.status]) {
                scounts[data.status] = 0;
            }
            scounts[data.status]++;
            return scounts;
        }, statusCounts);
        return statusCounts;
    }



    /**
     * Get the bug priority counts
     * @param {Object[]} bugData - contains all bug data for building the charts in this view
     * @return {Object} An object representing the count of every priority category
     *      @property: {String} priority category name
     *
     */
    getBugPriorityCounts(bugData) {
        let priorityCounts = {
        };


        //accumulate the counts to find all the priorities with the specified bugOrigin
        bugData.reduce((pcounts, data) => {
            if (!pcounts[data.priority]) {
                pcounts[data.priority] = 0;
            }
            pcounts[data.priority]++;
            return pcounts;
        }, priorityCounts);



        return priorityCounts;
    }


    /**
     * Get the status counts based on the selected priorities
     * @param {Object[]} bugData - contains all bug data for building the charts in this view
     * @param {String[]} priorityList - the list of priorities resulting from the selection of the "priority" chart
     * @return {Object} An object representing the count of every status category
     */
    getStatusCounts(bugData, priorityList) {
        let statusCounts = {
        };


        if (priorityList) {
            //accumulate the counts to find all the statuses with the specified priority
            bugData.reduce((scounts, data) => {
                    if (arrayContains(priorityList, data.priority)) {
                    //get the count
                    if (!scounts[data.status]) {
                        scounts[data.status] = 0;
                    }
                    scounts[data.status]++;
                }
                return scounts;
            }, statusCounts);

        }


        return statusCounts;
    }

    /**
     * Get the module counts based on the selected priorities
     * @param {Object[]} bugData - contains all bug data for building the charts in this view
     * @param {String[]} priorityList - the list of priorities resulting from the selection of the "priority" chart
     * @return {Object} An object representing the count of every modules
     */
    getModuleCounts(bugData, priorityList) {
        let moduleCounts = {
        };


        if (priorityList) {
            //accumulate the counts to find all the modules with the specified priority
            bugData.reduce((mcounts, data) => {
                if (arrayContains(priorityList, data.priority)) {
                    //get the count
                    if (!mcounts[data.module]) {
                        mcounts[data.module] = 0;
                    }
                    mcounts[data.module]++;
                }
                return mcounts;
            }, moduleCounts);

        }

        return moduleCounts;
    }


    /**
     * Get the fix version counts based on the selected priorities
     * @param {Object[]} bugData - contains all bug data for building the charts in this view
     * @param {String[]} priorityList - the list of priorities resulting from the selection of the "priority" chart
     * @return {Object} An object representing the count of every fix version numbers
     */
    getFixVersionCounts(bugData, priorityList) {
        let fixVersionCounts = {
        };


        if (priorityList) {
            //accumulate the counts to find all the fix versions with the specified priority
            bugData.reduce((vcounts, data) => {
                if (arrayContains(priorityList, data.priority)) {
                    //each bug could have more than one fix versions
                    data.fixVersions.map(fversion => {
                        //When using the JIRA search, the strings are case insensitive.
                        fversion = fversion.toUpperCase();
                        if (!vcounts[fversion]) {
                            vcounts[fversion] = 0;
                        }
                        vcounts[fversion]++;

                    });
                }
                return vcounts;
            }, fixVersionCounts);

        }

        return fixVersionCounts;
    }

    /**
     * Get the query string to get bug status data based on the affected version and fix version
     * @param versionNumber
     * @param   {String[]}    statusList - list of status  name
     * @return {string}
     */
    getStatusQueryString(versionNumber, statusList) {
        //The version number can be represented into two formats. E.g. 2.6 and 2.6.0
        let affectedVersions = getListOfVersionNumbersFromVersion(versionNumber);

        let searchQuery = "affectedVersion IN ('" + affectedVersions.join("','") + "') " +
            "AND fixVersion IN ('" + affectedVersions.join("','") + "') " +
            "AND project IN ('" + this.modules.join("','") + "') ";

        //add a status filter if any
        if (statusList) {
            searchQuery += "AND status IN ('" + statusList.join("','") + "') ";
        }

        return searchQuery;
    }

    /**
     * Get the query string to get data based on the affected version id
     * @param   {String}    versionNumber - Version number to filter from the query
     * @param   {String[]}    statusList - list of status  name
     * @param   {String[]}    priorityList - list of priority type name
     * @param   {String[]}    moduleList - list of modules
     * @param   {String[]}    fixVersionList - list of fix version numbers
     * @return  {String}    The query string
     */
    getQueryString(versionNumber, statusList, priorityList, moduleList, fixVersionList) {



        //The version number can be represented into two formats. E.g. 2.6 and 2.6.0
        let affectedVersions = getListOfVersionNumbersFromVersion(versionNumber);



        let searchQuery = "affectedVersion IN ('" + affectedVersions.join("','") + "') " +
            "AND fixVersion NOT IN ('" + affectedVersions.join("','") + "') " ;

        //add a status filter if any
        if (statusList) {
            searchQuery += "AND status IN ('" + statusList.join("','") + "') ";
        }

        //add a priority filter if any
        if (priorityList) {
            searchQuery += "AND priority IN ('" + priorityList.join("','") + "') ";
        }

        if (moduleList) {
            searchQuery += "AND project IN ('" + moduleList.join("','") + "') ";
        }
        else {
            searchQuery += "AND project IN ('" + this.modules.join("','") + "') ";
        }

        //add a fix version filter if any
        if (fixVersionList) {
            searchQuery += "AND fixVersion IN ('" + fixVersionList.join("','") + "') ";
        }

        return searchQuery;
    }




    /**
     * Update status chart data and the priority chart data
     * @param data - the overall data used to build the charts in this view
     * @param {String}    callback - Callback after "setState" is done
     */
    updateStatusChartData(data, callback) {
        this.selectedPriority = [];
        this.displayThirdChartType = null;

        //first store everything
        store.dispatch( {
            type: STORE_ACTION_ENUM.BUG_STATUS_UPDATE,
            tabId: EngineeringTabEnum.STATUS.value,
            bugPriority: [],
            lastChartType: null,
            bugCurrentVersion: this.props.version,
            bugCurrentModule: this.props.module
        });

        //build the status data
        let statusCounts = this.getBugStatusCounts(data);
        let statusLabels = Object.keys(statusCounts);
        let statusData = Object.values(statusCounts);


        //sometimes this chart doesn't need to show menu (for example if rendered from the release dashboard tab)
        let sMenuItems = null;
        let sChartMenu = null;
        if (!this.props.disableMenu) {
            //build the menu for each segment of the chart
            sMenuItems =
                getMenuItems(
                    [
                        DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA,
                    ]
                );

            sChartMenu = [];
            statusLabels.map(() => {
                sChartMenu.push(sMenuItems);
            });
        }

        let sColorArray = generateBackgroundColor(statusData.length);




        //re-render the status chart and reset the other two charts data
        this.setState({
            statusChartTitle: CHART_TITLE_ENUM.STATUS,
            statusChartData: statusData,
            statusChartLabels: statusLabels,
            statusChartMenu: sChartMenu,
            statusChartCenterMenu: sMenuItems,
            statusChartColorArray: sColorArray,
            thirdChartTitle: '',
            thirdChartData: [],
            thirdChartLabels: [],
            thirdChartColorArray: [],
            thirdChartMenu: [],
            isLoading: false
        }, callback);

    }


    /**
     * Update the priority chart data
     * @param data - the overall data used to build the charts in this view
     * @param {String}    callback - Callback after "setState" is done
     */
    updatePriorityChartData(data, callback) {
        //build the priority data
        let priorityCounts = this.getBugPriorityCounts(data);
        let priorityLabels = Object.keys(priorityCounts);
        let priorityData = Object.values(priorityCounts);


        //build the menu for each segment of the chart
        let pMenuItems =
            getMenuItems(
                [
                    DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA,
                    DOUGHNUT_CHART_MENU_ITEM_ENUM.STATUS,
                    DOUGHNUT_CHART_MENU_ITEM_ENUM.MODULE,
                    DOUGHNUT_CHART_MENU_ITEM_ENUM.FIX
                ]
            );

        let pChartMenu = [];
        priorityLabels.map(() => {
            pChartMenu.push(pMenuItems);
        });

        let pColorArray = generateBackgroundColor(priorityData.length);

        //re-render the priority chart and reset the other two charts data
        this.setState({
            priorityChartTitle: CHART_TITLE_ENUM.PRIORITY,
            priorityChartData: priorityData,
            priorityChartLabels: priorityLabels,
            priorityChartMenu: pChartMenu,
            priorityChartCenterMenu: pMenuItems,
            priorityChartColorArray: pColorArray,
            thirdChartTitle: '',
            thirdChartData: [],
            thirdChartLabels: [],
            thirdChartColorArray: [],
            thirdChartMenu: [],
            isLoading: false
        }, callback);


    }

    /**
     * Update center chart data based on the selection of the list of bug origin types and the center chart label
     * @param {Object} lastChartData - The data used to build the last chart
     * @param {String[]} selectedPriority - The selected labels on the priority chart
     * @param {String} chartTitle - The title of the last chart
     * @param {String}    callback - Callback after "setState" is done
     */
    updateThirdChartData(lastChartData, selectedPriority, chartTitle, callback) {
        this.selectedPriority = selectedPriority;
        this.displayThirdChartType = chartTitle;

        store.dispatch({
            type: STORE_ACTION_ENUM.BUG_STATUS_UPDATE,
            tabId: EngineeringTabEnum.STATUS.value,
            bugPriority: selectedPriority,
            lastChartType: chartTitle,
            bugCurrentVersion: this.props.version,
            bugCurrentModule: this.props.module
        });



        let data = Object.values(lastChartData);
        let labels = Object.keys(lastChartData);
        let chartColorArray = generateBackgroundColor(data.length);
        let menuItems = getMenuItems([DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA]);

        let chartMenu = [];
        labels.map(() => {
            chartMenu.push(menuItems);
        });

        //highlight a (or all) segment in the priority chart
        let priorityColorArray = getHighlightedColorArray(this.state.priorityChartLabels, selectedPriority);

        this.setState({
            priorityChartColorArray: priorityColorArray,
            thirdChartTitle: chartTitle,
            thirdChartData: data,
            thirdChartLabels: labels,
            thirdChartMenu: chartMenu,
            lastChartCenterMenu: menuItems,
            thirdChartColorArray: chartColorArray,
            isLoading: false
        }, callback);
    }



    /**
     * Handle the creation of the JIRA link and action according to the selection made in the charts.
     * @param {String[]}                        priorityList - List of selected priority types
     * @param {String | CHART_TITLE_ENUM}       thirdChart   - Type of the third chart
     * @param {String[]}                        thirdChartSelection - List of selected elements in the third chart
     */
    handleJiraLink(priorityList,
                   thirdChart, thirdChartSelection) {
        let statusList = null;
        let moduleList = null;
        let fixVersionList = null;


        if (thirdChart) {
            if (thirdChart  === CHART_TITLE_ENUM.FIX_VERSION) {
                fixVersionList = thirdChartSelection;
            }
            else if (thirdChart === CHART_TITLE_ENUM.STATUS) {
                statusList = thirdChartSelection;
            }
            else if (thirdChart === CHART_TITLE_ENUM.MODULE) {
                moduleList = thirdChartSelection;
            }
        }



        let statusState = this.getStatusState();
        let jqlQuery = this.getQueryString(statusState.versionNumber,
            statusList, priorityList, moduleList, fixVersionList);

        window.open(JIRA_LINK_URL + '?jql=' + jqlQuery, '_blank');

    }



    /**
     * Display the status chart on the specified chart nb (in the layout)
     * @param {Number | CHART_NB}               chartNb  - Chart nb (in the UI layout) to update
     * @param {String[]}                        priorityList - List of selected priorities
     */
    displayStatusChart(chartNb, priorityList) {

        let statusData = this.getStatusCounts(this.bugPriorityData, priorityList);

        if (chartNb === CHART_NB.THIRD) {
            this.updateThirdChartData(statusData, priorityList, CHART_TITLE_ENUM.STATUS);
        }

    }

    /**
     * Display the module chart on the specified chart nb (in the layout)
     * @param {CHART_NB}                        chartNb - Chart nb used to identify the chart in the UI layout
     * @param {Strubg[]}                        priorityList - List of selected priorities
     */
    displayModuleChart(chartNb, priorityList) {

        let moduleData = this.getModuleCounts(this.bugPriorityData, priorityList);

        if (chartNb === CHART_NB.THIRD) {
            this.updateThirdChartData(moduleData, priorityList, CHART_TITLE_ENUM.MODULE);
        }
    }

    /**
     * Display the fix version chart on the specified chart nb (in the layout)
     * @param {Number | CHART_NB}               chartNb  - Chart nb (in the UI layout) to update
     * @param {String[]}                        priorityList - List of selected priorities
     */
    displayFixVersionChart(chartNb, priorityList) {

        let fixVersionData = this.getFixVersionCounts(this.bugPriorityData, priorityList);

        if (chartNb === CHART_NB.THIRD) {
            this.updateThirdChartData(fixVersionData, priorityList, CHART_TITLE_ENUM.FIX_VERSION);
        }

    }

    //================================ EVENT HANDLERS ================================//




    /**
     * Event handler when a menu action from the bug status chart has been triggered
     * From that action, user is redirected to view a JIRA web page corresponding to the selection.
     * @param {Number}  index of the sector resulting from the bug status chart selection
     * @param {String}  label - The menu item title
     * @param {String}  sector - The sector name (sector label name)
     * @param {String}  scope - scope indicates what part of the chart the menu action has been triggered ("center"
     * of the chart or "sector".
     */
    onStatusChartMenuClick(index, label, sector, scope) {
        //find the bug status category from the chart
        let bugStatusList = [];

        //has the user clicked on "VIEW ALL" or on a specific sector of the chart?
        if (scope === DOUGHNUT_CHART_SCOPE_ENUM.SECTOR) {
            bugStatusList = [sector];
        }
        else if (scope === DOUGHNUT_CHART_SCOPE_ENUM.CENTER) {
            bugStatusList = this.state.statusChartLabels;
        }
            //in the case a JIRA LINK has been selected, direct to that link
        if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA) {

            let statusState = this.getStatusState();
            let jqlQuery = this.getStatusQueryString(statusState.versionNumber, bugStatusList);
            window.open(JIRA_LINK_URL + '?jql=' + jqlQuery, '_blank');

        }

    }

    /**
     * Event handler when a menu action from the priority chart has been triggered.
     * From that action, either we can display an addition chart  or
     * redirect to view a JIRA web page corresponding to the selection.
     * @param {Number}  index of the sector resulting from the priority chart selection
     * @param {String}  label - The menu item title
     * @param {String}  sector - The sector name (sector label name)
     * @param {String}  scope - scope indicates what part of the chart the menu action has been triggered ("center"
     * of the chart or "sector".
     */
    onPriorityChartMenuClick(index, label, sector, scope) {

        //find the category from the chart
        let selectionList = [];
        //has the user clicked on "VIEW ALL" or on a specific sector of the chart?
        if (scope === DOUGHNUT_CHART_SCOPE_ENUM.SECTOR) {
            selectionList = [sector];
        }
        else if (scope === DOUGHNUT_CHART_SCOPE_ENUM.CENTER) {
            selectionList = this.state.priorityChartLabels;
        }


        if (selectionList.length > 0) {
            if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.JIRA) {

                this.handleJiraLink(selectionList);
            }

            //get the data and render them in the center chart
            else if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.STATUS) {
                this.displayStatusChart(CHART_NB.THIRD, selectionList);
            }
            else if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.MODULE) {
                this.displayModuleChart(CHART_NB.THIRD, selectionList);
            }
            else if (label === DOUGHNUT_CHART_MENU_ITEM_ENUM.FIX) {
                this.displayFixVersionChart(CHART_NB.THIRD, selectionList);
            }
        }
    }

    /**
     * Event handler when a menu action from the last chart has been triggered.
     * The action redirects to view a JIRA web page corresponding to the selection.
     * @param {Number}  index of the sector resulting from the last chart selection
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
                this.handleJiraLink(this.selectedPriority, this.displayThirdChartType, selectionList);
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
    renderStatusChart() {
        let listOfVersionNumbers = getListOfVersionNumbersFromVersion(this.props.versionNumber);
        let title = this.props.isStatic
            ? null
            : <h3 className="bugChartTitle"> Bugs Raised and Fixed in {listOfVersionNumbers.join(" and ")}</h3>;
        let statusChart = (
            <div>
                {title}
                <DoughnutChart
                    textCenter={this.state.statusChartTitle}
                    centerFontSize = {this.props.centerFontSize ? this.props.centerFontSize : null}
                    numbers={this.state.statusChartData}
                    tooltip={this.state.statusChartLabels}
                    selectedStrokeColor={DOUGHNUT_CHART_HIGHLIGHT_COLOR}
                    colorArray={this.state.statusChartColorArray}
                    menuClick={this.onStatusChartMenuClick}
                    menu = { this.props.isStatic ? null : this.state.statusChartMenu }
                    centerMenu = { this.props.isStatic ? null : this.state.statusChartCenterMenu}
                    legends = { true }
                    canvasSize = {this.props.canvasSize ? this.props.canvasSize : null}
                    arcRadius = {this.props.arcRadius ? this.props.arcRadius : 50 }
                    sectorSelectionDisabled = { this.props.isStatic }

                />
            </div>

        );

        if (!this.state.isLoading && this.state.statusChartData) {
            return statusChart;
        }
    }

    /**
     * Render the center chart (priority or status chart)
     */
    renderPriorityChart() {
        let listOfVersionNumbers = getListOfVersionNumbersFromVersion(this.props.versionNumber);
        let priorityChart = (
            <div>
                <h3 className="bugChartTitle">
                    Bugs Raised in {listOfVersionNumbers.join(" and ")} and fixed in other releases
                </h3>
                <DoughnutChart
                    textCenter={this.state.priorityChartTitle}
                    numbers={this.state.priorityChartData}
                    tooltip={this.state.priorityChartLabels}
                    arcRadius={50}
                    selectedStrokeColor={DOUGHNUT_CHART_HIGHLIGHT_COLOR}
                    colorArray={this.state.priorityChartColorArray}
                    menuClick={this.onPriorityChartMenuClick}
                    menu = { this.state.priorityChartMenu }
                    centerMenu = { this.state.priorityChartCenterMenu }
                    legends = { true }
                />
                </div>
        );

        if (!this.props.isStatic) {

            if (!this.state.isLoading && this.state.priorityChartData ) {
                return priorityChart;
            }
        }

    }

    /**
     * Render the last chart (priority or status chart)
     */
    renderLastChart() {
        let listOfVersionNumbers = getListOfVersionNumbersFromVersion(this.props.versionNumber);
        let lastChart = (
            <div>
                <h3 className="bugChartTitle">
                    Bugs Raised in {listOfVersionNumbers.join(" and ")} and fixed in other releases
                </h3>
                <DoughnutChart
                    textCenter={this.state.thirdChartTitle}
                    numbers={this.state.thirdChartData}
                    tooltip={this.state.thirdChartLabels}
                    arcRadius={50}
                    selectedStrokeColor={DOUGHNUT_CHART_HIGHLIGHT_COLOR}
                    colorArray={this.state.thirdChartColorArray}
                    menuClick={this.onThirdChartMenuClick}
                    menu = { this.state.thirdChartMenu }
                    centerMenu = { this.state.lastChartCenterMenu }
                    legends = { true }
                />
            </div>
        );

        if (!this.state.isLoading && this.state.thirdChartData && this.state.thirdChartData.length > 0) {
            return lastChart;
        }

    }

    /**
     * Render the "PRIORITY" and "STATUS" graphs
     * @returns {XML}
     */
    render(){


        return (
            <div id="statuspage">

                <div className="chart-view">
                    {this.renderStatusChart()}

                    {this.renderPriorityChart()}

                    {this.renderLastChart()}

                </div>

            </div>

        )
    }
}

export default StatusBug

