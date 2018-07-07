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
    STATUS_ENV_ENUM,
    JQL_RESPONSE_STATUS_ENUM
} from "../../../../constants/constants";
import {store, storeModule} from "../Store/Store";
import EngineeringTitle from '../EngineeringHeader/EngineeringTitle';
import {queryJira, getListOfVersionNumbersFromVersion} from "../CommonFunction";
import StatusDev from "./StatusDev";
import StatusTest from "./StatusTest";
import StatusBug from "./StatusBug";



/**
 * Issue types for DEV status view (important: keep the strings in lower case for comparison)
 * @type {string[]}
 */
export const DEV_ISSUETYPE_IN_DEV = ['sub-task', 'task', 'technical task', 'doc task'];
export const BUG_ISSUETYPE_IN_DEV = ['bug', 'problem'];

/**
 * Status types for DEV status view (important: keep the strings in lower case for comparison)
 * @type {string[]}
 */
export const DONE_STATUS_IN_DEV = ["done", "ready for test", "in test"];
export const REMAINING_STATUS_IN_DEV = ["reopened", "to do", "in progress", "in triage", "in review", "scheduled"];

/**
 * Issue types for TEST status view (important: keep the strings in lower case for comparison)
 * @type {string[]}
 */
export const DEV_ISSUETYPE_IN_TEST = ['sub-task', 'task', 'technical task', 'test task', 'doc task'];
export const BUG_ISSUETYPE_IN_TEST = ['bug', 'problem'];

/**
 * Status types in DONE STATE (important keep the strings in lower case for comparison)
 * @type {string[]}
 */
export const  DONE_STATUS_IN_TEST = ["done"];
export const  REMAINING_STATUS_IN_TEST = ["ready for test", "in test"];

/**
 * JQL Fields parameters to use as filters.
 * @type {string[]}
 */
const JQL_BUGSTATUS_FIELDS = [
    'project',
    'status',
    'issuetype',
    'priority',
    'fixVersions',
    'versions'
];


/**
 * Props needed to pass to StatusBug from Release Dashboard
 * @prop{Boolean}   : isStatic
 * @prop{Object}    : canvasSize,
 * @prop{Number}    : arcRadius
 * @prop{Boolean}   : disableEngineeringTitle
 * @prop{Boolean}   : forceBugView
 */

/**
 * @description Component for the Status Tab displaying charts.
 * The component is made of several sub-components related to the different views: "DEV", "TEST" and "BUG"
 */
class Status extends Component {

    /**
     * Initializing the component
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);

        this.onEnvSelect = this.onEnvSelect.bind(this);
        this.onVersionSelect = this.onVersionSelect.bind(this);

        //get the list of all modules available
        this.modules = [];


        let modules = storeModule.getState();
        modules.map((module) => {
            if (module !== 'ALL') {
                this.modules.push(module);
            }
        });

        //get the Status tab state to find the selected module and the selected affected version
        let statusTabState = this.getStatusTabState();

        this.state = {
            selectedVersion: statusTabState.version,
            selectedModule: statusTabState.module,
            selectedEnv: this.props.forceBugView ? STATUS_ENV_ENUM.BUG : statusTabState.env,
            devChartData: [],
            testChartData: [],
            bugStatusChartData: [],
            bugChartData: [],
            isLoading: true
        };


    }

    /**
     * Wait until everything is mounted before building all the data and rendering them
     */
    componentDidMount() {
        document.title = "Status";

        //get the Status tab state to find the selected module and the selected affected version
        let statusTabState = this.getStatusTabState();

        let currentModule = statusTabState.module;
        if (this.props.isStatic) {
            currentModule = 'ALL';
        }

        //check if the parent is asking for a "static" view
        //if it is, then take the version coming from the parent component
        //TODO update with the new data
        if (this.props.isStatic) {
            let currentVersionNumber = this.props.rdVersionSelected;
            //get the data for filling up the charts
            this.fetchStatusDataForBugGraphs(currentVersionNumber, (bugStatusData) => {
                this.setState({
                    bugStatusChartData: bugStatusData,
                    isLoading: false
                });
            });

        }
        else {
            //get the data for filling up the charts
            this.fetchDataForDev(statusTabState.module, statusTabState.versionNumber, (devData) => {
                this.fetchDataForTest(statusTabState.module, statusTabState.versionNumber, (testData) => {
                    this.fetchStatusDataForBugGraphs(statusTabState.versionNumber, (bugStatusData) => {
                        this.fetchDataForBugGraphs(statusTabState.versionNumber, (bugData) => {
                            this.setState({
                                devChartData: devData,
                                testChartData: testData,
                                bugStatusChartData: bugStatusData,
                                bugChartData: bugData,
                                isLoading: false
                            });
                        });
                    });
                });
            });

        }
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
            this.fetchStatusDataForBugGraphs(currentVersionNumber, (bugStatusData) => {
                this.setState({
                    bugStatusChartData: bugStatusData,
                    isLoading: false
                });
            });
        }

    }


    //================================ PRIVATE METHODS ================================//
    /**
     * Get the current state of Status tab.
     * @return {Object | Store}  Store object represent the Status tab state.
     */
    getStatusTabState() {
        let stateStore = store.getState();
        let statusTabState = stateStore.find(item => item.tabId === EngineeringTabEnum.STATUS.value);

        return statusTabState;
    }



    //-------------------------------- STATUS AND TEST VIEW IMPLEMENTATION --------------------------------//

    /**
     * Get status data for "Development".
     * @param versionNumber - The current affected release version number
     * @param callback - A callback function to be called once the query is done.
     */
    fetchDataForDev(moduleName, versionNumber, callback) {
        let searchQuery = this.getDevQueryString(moduleName, versionNumber);

        let dataForGraphs = [];     //results from the JQL query
        //make the query to jira
        queryJira(searchQuery, JQL_BUGSTATUS_FIELDS, (result) => {

            let jiraResult = JSON.parse(result);

            if (jiraResult.status === JQL_RESPONSE_STATUS_ENUM.FAILED) {
                //there is an error
            }
            else if (jiraResult.status === JQL_RESPONSE_STATUS_ENUM.SUCCESS) {
                let bugResults = jiraResult.results;
                if (bugResults && bugResults.length > 0) {
                    //gather the results and save only the fields we need
                    bugResults.map((bugResult) => {

                        let fixVersions = [];
                        //save the version numbers
                        Object.values(bugResult.fields.fixVersions)
                            .map((version) => {
                                fixVersions.push(version.name);
                            });
                        let versions = [];
                        Object.values(bugResult.fields.versions)
                            .map((version) => {
                                versions.push(version.name);
                            });



                        let data  = {
                            priority: bugResult.fields.priority.name,
                            status: bugResult.fields.status.name,
                            issuetype: bugResult.fields.issuetype.name,
                            fixVersions: fixVersions,
                            versions: versions
                        };

                        dataForGraphs.push(data);

                    });
                }
            }

            //save a record of this data (for Test and for Dev). we need it to display the charts on demand.

            if (typeof callback === 'function') {
                /**
                 * callback with an object
                 * @typedef {Object}
                 * @property {String} bugOrigin
                 * @property {String} priority
                 * @property {String} status
                 * @property {String} issuetype
                 * @property {Array | string} versions
                 */
                callback(dataForGraphs);
            }

        });

    }




    /**
     * Get the query string to get the DEV status based on the module name and the affected version id
     * @param   {String}    moduleName - Module name to filter from the query
     * @param   {String}    versionNumber - Version number to filter from the query
     * @return  {String}    The query string
     */
    getDevQueryString(moduleName, versionNumber) {
        let moduleList = [moduleName];
        if (moduleName === 'ALL') {
            moduleList = this.modules;
        }

        //The version number can be represented into two formats. E.g. 2.6 and 2.6.0
        let fixVersions = getListOfVersionNumbersFromVersion(versionNumber);

        let issueTypes = DEV_ISSUETYPE_IN_DEV.concat(BUG_ISSUETYPE_IN_DEV);
        let statusTypes = DONE_STATUS_IN_DEV.concat(REMAINING_STATUS_IN_DEV);


        let searchQuery = "project IN ('" + moduleList.join("','") + "') " +
            "AND issuetype IN ('" + issueTypes.join("','") + "') " +
            "AND status IN ('" + statusTypes.join("','") + "') " +
            "AND fixVersion IN ('" + fixVersions.join("','") + "') " ;

        return searchQuery;
    }





    /**
     * Get status data for "Test".
     * @param versionNumber - The current affected release version number
     * @param callback - A callback function to be called once the query is done.
     */
    fetchDataForTest(moduleName, versionNumber, callback) {
        let searchQuery = this.getTestQueryString(moduleName, versionNumber);

        let dataForGraphs = [];     //results from the JQL query
        //make the query to jira
        queryJira(searchQuery, JQL_BUGSTATUS_FIELDS, (result) => {

            let jiraResult = JSON.parse(result);

            if (jiraResult.status === JQL_RESPONSE_STATUS_ENUM.FAILED) {
                //there is an error
            }
            else if (jiraResult.status === JQL_RESPONSE_STATUS_ENUM.SUCCESS) {
                let bugResults = jiraResult.results;
                if (bugResults && bugResults.length > 0) {
                    //gather the results and save only the fields we need
                    bugResults.map((bugResult) => {

                        let fixVersions = [];
                        //save the version numbers
                        Object.values(bugResult.fields.fixVersions)
                            .map((version) => {
                                fixVersions.push(version.name);
                            });
                        let versions = [];
                        Object.values(bugResult.fields.versions)
                            .map((version) => {
                                versions.push(version.name);
                            });



                        let data  = {
                            priority: bugResult.fields.priority.name,
                            status: bugResult.fields.status.name,
                            issuetype: bugResult.fields.issuetype.name,
                            fixVersions: fixVersions,
                            versions: versions
                        };

                        dataForGraphs.push(data);

                    });
                }
            }

            //save a record of this data (for Test and for Dev). we need it to display the charts on demand.

            if (typeof callback === 'function') {
                /**
                 * callback with an object
                 * @typedef {Object}
                 * @property {String} bugOrigin
                 * @property {String} priority
                 * @property {String} status
                 * @property {String} issuetype
                 * @property {Array | string} versions
                 */
                callback(dataForGraphs);
            }

        });

    }

    /**
     * Get the query string to get the DEV status based on the module name and the affected version id
     * @param   {String}    moduleName - Module name to filter from the query
     * @param   {String}    versionNumber - Version number to filter from the query
     * @return  {String}    The query string
     */
    getTestQueryString(moduleName, versionNumber) {
        let moduleList = [moduleName];
        if (moduleName === 'ALL') {
            moduleList = this.modules;
        }

        //The version number can be represented into two formats. E.g. 2.6 and 2.6.0
        let fixVersions = getListOfVersionNumbersFromVersion(versionNumber);

        let issueTypes = DEV_ISSUETYPE_IN_TEST.concat(BUG_ISSUETYPE_IN_TEST);
        let statusTypes = DONE_STATUS_IN_TEST.concat(REMAINING_STATUS_IN_TEST);


        let searchQuery = "project IN ('" + moduleList.join("','") + "') " +
            "AND issuetype IN ('" + issueTypes.join("','") + "') " +
            "AND status IN ('" + statusTypes.join("','") + "') " +
            "AND fixVersion IN ('" + fixVersions.join("','") + "') " ;

        return searchQuery;
    }





    //-------------------------------- BUG VIEW IMPLEMENTATION --------------------------------//

    /**
     * Fetch all bug status data. These data are used for the status charts in the bug view.
     * @param versionNumber
     * @param callback
     */
    fetchStatusDataForBugGraphs(versionNumber, callback) {
        let searchQuery = this.getBugStatusQueryString(versionNumber);

        let dataForGraphs = [];

        queryJira(searchQuery, JQL_BUGSTATUS_FIELDS, (result) => {

            let jiraResult = JSON.parse(result);

            if (jiraResult.status === JQL_RESPONSE_STATUS_ENUM.FAILED) {
                //there is an error
            }
            else if (jiraResult.status === JQL_RESPONSE_STATUS_ENUM.SUCCESS) {
                let bugResults = jiraResult.results;
                if (bugResults && bugResults.length > 0) {
                    //gather the results and save only the fields we need
                    bugResults.map((bugResult) => {

                        let fixVersions = [];
                        //save the version numbers
                        Object.values(bugResult.fields.fixVersions)
                            .map((version) => {
                                fixVersions.push(version.name);
                            });
                        let versions = [];
                        Object.values(bugResult.fields.versions)
                            .map((version) => {
                                versions.push(version.name);
                            });



                        let data  = {
                            status: bugResult.fields.status.name,
                        };

                        dataForGraphs.push(data);

                    });
                }
            }

            if (typeof callback === 'function') {
                /**
                 * callback with an object
                 * @typedef {Object}
                 * @property {String} bugOrigin
                 * @property {String} priority
                 * @property {String} status
                 * @property {String} issuetype
                 * @property {Array | string} versions
                 */
                callback(dataForGraphs);
            }

        });
    }


    /**
     * Fetch all priority from bug data. These data are used for the priority charts in the bug view.
     * @param   {String}    versionNumber - Version number to filter from the query
     * @param   {Function}  callback - Callback function to be called once data is fetched
     */
    fetchDataForBugGraphs(versionNumber, callback){
        let searchQuery = this.getBugQueryString(versionNumber);

        let dataForGraphs = [];     //results from the JQL query
        //make the query to jira
        queryJira(searchQuery, JQL_BUGSTATUS_FIELDS, (result) => {

            let jiraResult = JSON.parse(result);

            if (jiraResult.status === JQL_RESPONSE_STATUS_ENUM.FAILED) {
                //there is an error
            }
            else if (jiraResult.status === JQL_RESPONSE_STATUS_ENUM.SUCCESS) {
                let bugResults = jiraResult.results;
                if (bugResults && bugResults.length > 0) {
                    //gather the results and save only the fields we need
                    bugResults.map((bugResult) => {

                        let fixVersions = [];
                        //save the version numbers
                        Object.values(bugResult.fields.fixVersions)
                            .map((version) => {
                                fixVersions.push(version.name);
                            });
                        let versions = [];
                        Object.values(bugResult.fields.versions)
                            .map((version) => {
                                versions.push(version.name);
                            });



                        let data  = {
                            priority: bugResult.fields.priority.name,
                            status: bugResult.fields.status.name,
                            issuetype: bugResult.fields.issuetype.name,
                            fixVersions: fixVersions,
                            versions: versions,
                            module: bugResult.fields.project.key
                        };

                        dataForGraphs.push(data);

                    });
                }
            }


            if (typeof callback === 'function') {
                /**
                 * callback with an object
                 * @typedef {Object}
                 * @property {String} bugOrigin
                 * @property {String} priority
                 * @property {String} status
                 * @property {String} issuetype
                 * @property {Array | string} versions
                 */
                callback(dataForGraphs);
            }

        });
    }

    /**
     * Get the query string to get BUG status data
     * @param {String}      versionNumber - version number
     * @return  {String}    The query string
     */
    getBugStatusQueryString(versionNumber) {
        //The version number can be represented into two formats. E.g. 2.6 and 2.6.0
        let affectedVersions = getListOfVersionNumbersFromVersion(versionNumber);

        let searchQuery = "project IN ('" + this.modules.join("','") + "') " +
            "AND affectedVersion IN ('" + affectedVersions.join("','") + "') " +
            "AND fixVersion IN ('" + affectedVersions.join("','") + "') " ;

        return searchQuery;
    }


    /**
     * Get the query string to get BUG priority data
     * @param   {String}     versionNumber - version number
     * @return  {String}    The query string
     */
    getBugQueryString(versionNumber) {


        //The version number can be represented into two formats. E.g. 2.6 and 2.6.0
        let affectedVersions = getListOfVersionNumbersFromVersion(versionNumber);


        let searchQuery = "project IN ('" + this.modules.join("','") + "') " +
            "AND affectedVersion IN ('" + affectedVersions.join("','") + "') " +
            "AND fixVersion NOT IN ('" + affectedVersions.join("','") + "') " ;

        return searchQuery;
    }



    //================================ EVENT HANDLERS ================================//

    /**
     * Event handler triggered when a new selection on the environment dropdown list has been made.
     * @param   {String}    env - The newly selected environment view
     */
    onEnvSelect(env) {
        let statusState = this.getStatusTabState();
        //change view
        this.setState({
            selectedEnv: env,
            selectedVersion: statusState.version,
            selectedModule: statusState.module

        });
    }

    /**
     * Event handler triggered when a new selection on the version dropdown list has been made.
     * @param   {Number}    version - The newly selected version id
     */
    onVersionSelect(version) {
        this.setState({isLoading: true});

        let statusTabState = this.getStatusTabState();
        //fetch new data
        this.fetchDataForDev(statusTabState.module, statusTabState.versionNumber, (devData) => {
            this.fetchDataForTest(statusTabState.module, statusTabState.versionNumber, (testData) => {
                this.fetchStatusDataForBugGraphs(statusTabState.versionNumber, (bugStatusData) => {
                    this.fetchDataForBugGraphs(statusTabState.versionNumber, (bugData) => {
                        this.setState({
                            selectedVersion: version,
                            devChartData: devData,
                            testChartData: testData,
                            bugStatusChartData: bugStatusData,
                            bugChartData: bugData,
                            isLoading: false
                        });
                    });

                });

            });

        });
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
     * Render the engineering menu bar with dropdown lists
     */
    renderEngineeringTitle() {
        let engineeringTitle = (
            <EngineeringTitle
                title={"Status"}
                engineeringTabId={EngineeringTabEnum.STATUS.value}
                onEnvSelectCallback={this.onEnvSelect}
                onVersionSelectCallback={this.onVersionSelect}
            />
        );

        if (!this.props.disableEngineeringTitle) {
            return engineeringTitle;
        }
    }


    /**
     * Render the dev view with the chart of DEV data
     */
    renderDevView() {

        let devView = (
            <StatusDev
                version = {this.state.selectedVersion}
                versionNumber = {this.getStatusTabState().versionNumber}
                module = {this.state.selectedModule}
                moduleList = {this.modules}
                chartData = {this.state.devChartData}
            />

        );

        if (!this.state.isLoading && this.state.selectedEnv === STATUS_ENV_ENUM.DEV ) {
            return devView;
        }

    }

    /**
     * Render the test view with the chart of TEST data
     */
    renderTestView() {
        let testView = (
            <StatusTest
                version = {this.state.selectedVersion}
                versionNumber = {this.getStatusTabState().versionNumber}
                module = {this.state.selectedModule}
                moduleList = {this.modules}
                chartData = {this.state.testChartData}
            />
        );

        if (!this.state.isLoading && this.state.selectedEnv === STATUS_ENV_ENUM.TEST ) {
            return testView;
        }

    }

    /**
     * Render the bug view with status charts
     * @return {*}
     */
    renderBugView() {
        let bugView = (
            <StatusBug
                version = {this.state.selectedVersion}
                versionNumber = {this.getStatusTabState().versionNumber}
                module = {this.state.selectedModule}
                moduleList = {this.modules}
                statusChartData = {this.state.bugStatusChartData}
                chartData = {this.state.bugChartData}
                isStatic = {this.props.isStatic ? this.props.isStatic : null}
                centerFontSize = {this.props.centerFontSize ? this.props.centerFontSize : null}
                canvasSize = {this.props.canvasSize ? this.props.canvasSize : null}
                arcRadius = {this.props.arcRadius ? this.props.arcRadius : null }
            />
        );


        if (!this.state.isLoading && this.state.selectedEnv  === STATUS_ENV_ENUM.BUG ) {
            return bugView;
        }
    }

    /**
     * Render the status charts view depending on the selected view.
     * @return {XML}
     */
    render()
    {
      return <div className="row">

          {this.renderEngineeringTitle()}

          {this.renderLoadingIcon()}

          {this.renderDevView()}

          {this.renderTestView()}

          {this.renderBugView()}


          </div>
    }
}
export default Status;