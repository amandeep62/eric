import {Component} from 'react';
import PropTypes from 'prop-types';
import {getHttpRequest} from "../../../../httprequest/http_connection";
import {userPermissions, EngineeringTabEnum, RoadmapVersionEnum, timeList} from "../../../../constants/constants"
import {getAllModules, getAllThemes} from "../CommonFunction"
import {store} from "../Store/Store"
import {DropdownList} from 'react-widgets';
import EnvDropdownList from "../DropdownList/EnvDropdownList"
import VersionDropdownList from "../DropdownList/VersionDropdownList"
import ModuleDropdownList from "../DropdownList/ModuleDropdownList"
import GranularityDropdownList from "../DropdownList/GranularityDropdownList"
import YearDropdownList from "../DropdownList/YearDropdownList"
import RoadmapDropdownList from "../DropdownList/RoadmapDropdownList";


import DatePicker from "react-bootstrap-date-picker";

class EngineeringTitle extends Component {

    /**
     * Build a container of menus specific for every tab.
     * Every tab are defined with a specific set of dropdown lists and title.
     *
     * @param props - Creation parameters for this class
     * @param context
     */

    constructor(props, context) {
        super(props, context);
        this.onVersionSelect = this.onVersionSelect.bind(this);

        let selectedVersionState = store.getState();
        let tabVersionObject = selectedVersionState.find(item => item.tabId === this.props.engineeringTabId);

        this.selectedVersion = tabVersionObject.version;

    }



    /**
     * Render the menu bar of the dropdown lists for every tab
     * @returns {XML}
     */
    render(){
        let dropdownListComponent = null;
        switch (this.props.engineeringTabId){
            case EngineeringTabEnum.PRODUCTREADINESS.value:
                dropdownListComponent = <ProductReadinessDropdownList
                    callBackToGetChildRef={this.props.callBackToGetChildRef}
                    productReadinessOnSelect={this.props.productReadinessOnSelect}
                    engineeringTabId={this.props.engineeringTabId}
                    editProductReadinessTableClick={this.props.editProductReadinessTableClick}
                    saveProductReadinessTableClick ={this.props.saveProductReadinessTableClick}
                    cancelProductReadinessTableClick ={this.props.cancelProductReadinessTableClick}
                />;
                break;

            case EngineeringTabEnum.ROADMAP.value:
                dropdownListComponent = <RoadmapReleaseDashboardDropdownList
                    onVersionSelect = {this.props.onVersionSelect}
                    engineeringTabId = {this.props.engineeringTabId}
                    filterByModule = {this.props.filterByModule}
                /> ;
                break;

            case EngineeringTabEnum.RELEASEDASHBOARD.value:
                dropdownListComponent = <ReleaseDashboardDropdownList
                    engineeringTabId={this.props.engineeringTabId}
                    onVersionSelectCallback={this.props.onVersionSelectCallback}
                    onYearSelectCallBack={this.props.onYearSelectCallBack}
                />;
                break;

            case EngineeringTabEnum.FST.value:
                dropdownListComponent = <FSTDropdownList
                    engineeringTabId={this.props.engineeringTabId}
                    onVersionSelectCallback={this.props.onVersionSelectCallback}
                    onModuleSelectCallback={this.props.onModuleSelectCallback}
                />;
                break;

            case EngineeringTabEnum.STATUS.value:
                dropdownListComponent = <StatusDropdownList
                    engineeringTabId={this.props.engineeringTabId}
                    onEnvSelectCallback={this.props.onEnvSelectCallback}
                    onVersionSelectCallback={this.props.onVersionSelectCallback}
                    onModuleSelectCallback={this.props.onModuleSelectCallback}
                />;
                break;

            case EngineeringTabEnum.CAPACITY.value:
                dropdownListComponent = <CapacityDropdownList
                    selectedVersion={this.selectedVersion}
                    engineeringTabId={this.props.engineeringTabId}
                    onVersionSelectCallback={this.props.onVersionSelectCallback}
                    onTimeSelectCallback={this.props.onTimeSelectCallback}
                />;
                break;

            case EngineeringTabEnum.QUALITY.value:
                dropdownListComponent = <QualityDropdownList
                    engineeringTabId={this.props.engineeringTabId}
                    onViewChangeCallBack={this.props.onViewChangeCallBack}
                    onGranularitySelect={this.props.onGranularitySelect}
                />;
                break;
            case EngineeringTabEnum.TRENDS.value:
                dropdownListComponent = <TrendsDropdownList
                    engineeringTabId={this.props.engineeringTabId}
                    onModuleSelectCallback={this.props.onModuleSelectCallback}
                    handleStartDateChange={this.props.handleStartDateChange}
                    handleEndDateChange={this.props.handleEndDateChange}
                    onViewChangeCallBack={this.props.onViewChangeCallBack}
                    onGranularitySelect={this.props.onGranularitySelect}
                    startDate={ this.props.startDate }
                    endDate={ this.props.endDate }
                />;
                break;
        }


        return <div className="col-md-12 blueLine">
                <span>{this.props.title}</span><h1></h1>
                {dropdownListComponent}
            </div>
    }

    /**
     * Callback method when the selection on a release version has changed in the "ROADMAP" tab
     * TODO should this method be defined here?
     * @param version
     * @param versionName
     */
    onVersionSelect(version, versionName){

        this.props.onVersionSelect(version,versionName);

    }
}

//Function and class members type checks are done here
EngineeringTitle.propTypes = {
    engineeringTabId: PropTypes.number,
    title: PropTypes.string.isRequired,
    onVersionSelect: PropTypes.func,
    productReadinessOnSelect: PropTypes.func,

};


/**
 * Dropdown list for Roadmap and Release Dashboard tabs
 * TODO this class needs to be reviewed.
 */
class RoadmapReleaseDashboardDropdownList extends Component {

    /**
     * Build the dropdown list for the Roadmap and  Release Dashboard tabs
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.onVersionSelectionCallBack = this.onVersionSelectionCallBack.bind(this);

        this.state = {
            selectedVersion:0,
            year : new Date().getFullYear()
        };
    }

    /**
     * Event hander called when the selection of a version has changed in the dropdown list
     * TODO review the usage of versionName
     * @param version The version id selected in the dropdown list
     * @param versionName The version name selected in the dropdown list
     */
    onVersionSelectionCallBack(version, versionName){
        this.setState({selectedVersion:parseInt(version)});
        this.props.onVersionSelect(version, versionName, this.state.year)
    }


    /**
     * Trigger change when Year selected
     */
     onYearSelection(e){
        this.setState({
            year: e
        });

        if (this.props.onYearSelectCallBack)
            this.props.onYearSelectCallBack();
     }


    /**
     * Render the dropdown lists of Roadmap and Release Dashboard tab
     * The first dropdown list contains a list of options such as "Roadmap", "Sprint Plan" and a list of release
     * versions.
     * The second dropdown list contains a list of years.
     * In the case where a release version has been selected, then display additional dropdown lists: modules
     * and themes (RoadmapUDNVersionDropdownList)
     * @returns {XML}
     */
    render(){

        return <div className="selection-group-udn">
            {this.state.selectedVersion > 0
                ? <RoadmapUDNVersionDropdownList
                    onVersionSelect = {this.props.onVersionSelect}
                    engineeringTabId={this.props.engineeringTabId}
                    filterByModule ={this.props.filterByModule}/>
                : null
            }

            <RoadmapDropdownList
                onVersionSelectionCallBack={this.onVersionSelectionCallBack}
                engineeringTabId = {this.props.engineeringTabId}
                selectedVersion={this.props.selectedVersion}
                year={ this.state.year }  />

            {this.state.selectedVersion === RoadmapVersionEnum.ROADMAPVERSION.value
                ? null
                : <YearDropdownList
                    year={ this.state.year }
                    engineeringTabId={this.props.engineeringTabId}
                    onYearSelectCallBack={(e) => this.onYearSelection(e) } />
            }
        </div>
    }
}




/**
 * Render dropdown lists for Roadmap and Release Dashboard tabs.
 * These dropdown lists are rendered only when a release version has been
 * selected in RoadmapReleaseDashboardDropdownList.
 */
class RoadmapUDNVersionDropdownList extends Component {

    constructor(props, context) {
        super(props, context);

        this.filterByModule = this.filterByModule.bind(this);
        getAllModules((allModulesArray)=>{
            getAllThemes((allThemesArray) => {
                allThemesArray.unshift("ALL");

                this.allModulesArray = allModulesArray;
                this.allThemesArray = allThemesArray;

                this.setState({
                    allModulesArray:allModulesArray,
                    allThemesArray:allThemesArray
                });
            })
        });

        this.state = {selectedVersion:0,
            allModulesArray:[],
            allThemesArray:[]
        };


    }

    /**
     * Event handler called when a selection in the themes or the modules dropdown list has changed.
     * @param event - Event object resulting for the selection.
     */
    filterByModule(event) {
        this.props.filterByModule(event)

    }

    /**
     * Render the themes and modules dropdown lists.
     * @returns {XML}
     */
    render(){
        let that = this;
        let selectedModuleState = store.getState();
        let currentTab = selectedModuleState.find(item => item.tabId === this.props.engineeringTabId);
        return <div className="theme-module-group">
                    <span className="selectTitle">Theme :</span>
                    <select className="dropdown-button" id="themelist" defaultValue="ALL" onChange={that.filterByModule}>
                        {
                            this.state.allThemesArray.map(function (data, index) {
                                return (<option  key={"option" + index} value={data} className="dropdown-item">{data}</option>);
                            })
                        }
                    </select>
                    <span className="selectTitle">Module :</span>
                    <select className="dropdown-button" id="scopelist" defaultValue={currentTab.module} onChange={that.filterByModule}>
                        {
                            this.state.allModulesArray.map(function (data, index) {
                                return (<option  key={"option" + index} value={data} className="dropdown-item">{data}</option>);
                            })
                        }n
                    </select>
                </div>
    }
}




class TimeDropdownList extends Component {

    constructor(props, context) {
        super(props, context);

        let selectedState = store.getState();
        let tabVersionObject = selectedState.find(item => item.tabId === this.props.engineeringTabId);
        this.selectedTime = tabVersionObject.time;

        this.state = {
            timeList: timeList
        };
    }

    onModuleSelect(e){
        let time = e.target.value;
        this.props.onTimeSelectCallback(time)
        store.dispatch({ type: 'TIME_UPDATE', time:parseInt(time), tabId: this.props.engineeringTabId });
    }

    render(){

        return <select
            className="select-udn"
            onChange={(e)=>this.onModuleSelect(e)} defaultValue={this.selectedTime} >
            {
                this.state.timeList.map(function (object, index) {
                    return (<option key={"module" + index} value={object.time}>{object.name}</option>)
                })
            }
        </select>
    }
}


export default EngineeringTitle;


class ProductReadinessDropdownList extends Component {

    constructor(props, context) {
        super(props, context);


        this.state={productTitleArray:[],editStatus:false,value:""};
        this.editProductReadinessTableClick = this.editProductReadinessTableClick.bind(this);
        this.saveProductReadinessTableClick=this.saveProductReadinessTableClick.bind(this);
        this.cancelProductReadinessTableClick=this.cancelProductReadinessTableClick.bind(this);
        this.productReadinessOnSelect=this.productReadinessOnSelect.bind(this);
        this.loadProductTitle=this.loadProductTitle.bind(this);

        this.loadProductTitle();


    }


    loadProductTitle(){
        getHttpRequest("/getProdReadinessTitle", (data, statusCode)=> {
            if(statusCode === 200){
                let productTitleArray = JSON.parse(data);
                let prodtitleArray = productTitleArray.map((a)=>a.title);
                this.setState({productTitleArray:prodtitleArray,value:prodtitleArray[0]});
            }
        })
    }

    editProductReadinessTableClick(){
        let editStatus = !this.state.editTableView
        this.setState({editTableView:editStatus});
        this.props.editProductReadinessTableClick(editStatus);
    }

    saveProductReadinessTableClick(){

        let editStatus = !this.state.editTableView
        this.setState({editTableView:editStatus});
        this.props.saveProductReadinessTableClick(editStatus);
    }

    cancelProductReadinessTableClick(){
        let editStatus = !this.state.editTableView
        this.setState({editTableView:editStatus});
        this.props.cancelProductReadinessTableClick(editStatus);
    }

    productReadinessOnSelect(e){
        this.setState({value:e});
        this.props.productReadinessOnSelect?this.props.productReadinessOnSelect(e):null;
    }

    componentWillReceiveProps(nextProps){
        //this.loadProductTitle();
    }

    componentDidMount(){
        this.props.callBackToGetChildRef(this.loadProductTitle);
    }

    render(){

        return this.state.productTitleArray?<div className="page-actions">
            {this.props.userPermissions == userPermissions ? <button value="addTheme"
                                                                     className="addThemeGreen pull-left"
                                                                     onClick={this.editProductReadinessTableClick}
                                                                     ref="tableView">Edit Table
            </button> : null}
            {!this.state.editTableView ?
                <button className="btn-udn-green pull-left" onClick={this.editProductReadinessTableClick}>Edit Table</button>
                : <div>
                    <button value="addTheme"
                            className="btn-udn-green pull-left"
                            onClick={this.cancelProductReadinessTableClick} >Cancel
                    </button>
                    <button value="addTheme"
                            className="btn-udn-green pull-left"
                            onClick={this.saveProductReadinessTableClick} >Save
                    </button>
                </div>
            }

            <DropdownList
                className="drop-down-all"
                id={'PR-selector'}
                data={this.state.productTitleArray}
                value={this.state.value}
                onChange={(e) => this.productReadinessOnSelect(e)}
            />
        </div>:<div></div>}
}

ProductReadinessDropdownList.propTypes = {
    productReadinessOnSelect: PropTypes.func,
};


/**
 * Builds a set of dropdown lists for the Release Dashboard tab
 */
class ReleaseDashboardDropdownList extends Component {

    /**
     * Initialize the state for the the release dashboard dropdown lists.
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.state = {
            "year" : new Date().getFullYear()
        };
    }

    /**
     * Trigger change when Year selected
     */
     onYearSelection(e){
        this.setState({
            "year": e
        });
        this.props.onYearSelectCallBack();
     }




    /**
     * Render the year and the version (with Summary) dropdown list
     */
    render() {
        return (
            <div>
                <VersionDropdownList
                    engineeringTabId={this.props.engineeringTabId}
                    onVersionSelectCallback={this.props.onVersionSelectCallback}
                    summaryOptionEnabled={true}
                    year={ this.state.year }
                />

                <YearDropdownList
                    engineeringTabId={this.props.engineeringTabId}
                    onYearSelectCallBack={(e) => this.onYearSelection(e) }
                />
            </div>

        )

    }
}

/**
 * This class builds a set of dropdown lists for the Status tab.
 * - environment type dropdown list
 * - module dropdown list
 * - version dropdown list
 */
class StatusDropdownList extends Component {

    /**
     * Constructor of the Quality dropdown lists component
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.state = {
            "year" : new Date().getFullYear()
        };
    }

    /**
     * Trigger change when Year selected
     */
     onYearSelection(e){
        this.setState({
            "year": e
        });
     }

    /**
     * Render the environment, module and version dropdown list
     * @return {XML}
     */
    render(){
        return <div>
            <EnvDropdownList
                engineeringTabId={this.props.engineeringTabId}
                onEnvSelectCallback={this.props.onEnvSelectCallback}
            />

            <VersionDropdownList
                engineeringTabId={this.props.engineeringTabId}
                onVersionSelectCallback={this.props.onVersionSelectCallback}
                year={ this.state.year }
            />

            <YearDropdownList
                engineeringTabId={this.props.engineeringTabId}
                onYearSelectCallBack={(e) => this.onYearSelection(e) }
            />
        </div>
    }
}


/**
 * This class builds a set of dropdown lists for the Quality tab.
 * - module dropdown list
 * - year dropdown list
 */
class QualityDropdownList extends Component {

    /**
     * Constructor of the Quality dropdown lists component
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.changeView = this.changeView.bind(this);
    }

    /***
     * Handle Event to change the start date
     * @param e : changed start date
     */
    changeView(e){
        this.props.onViewChangeCallBack(e);
    }

    /**
     * Render the module and year dropdown lists
     * @returns {XML}
     */
    render(){
        return <div>
            <select className="select-udn" defaultValue="Current Backlog"
                onChange={(e)=>this.changeView(e)} >>
                <option>Current Backlog</option>
                <option>Bug Trends</option>
            </select>
        </div>
    }
}

class CapacityDropdownList extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            "year" : new Date().getFullYear()
        };
    }

    /**
     * Trigger change when Year selected
     */
     onYearSelection(e){
        this.setState({
            "year": e
        });
        // this.props.onYearSelectCallBack();
     }
    render(){
        return <div>
            <TimeDropdownList  engineeringTabId={this.props.engineeringTabId} onTimeSelectCallback={this.props.onTimeSelectCallback}/>
            <VersionDropdownList  
                engineeringTabId={this.props.engineeringTabId} 
                onVersionSelectCallback={this.props.onVersionSelectCallback}
                year={ this.state.year }
            />
            <YearDropdownList  
                engineeringTabId={this.props.engineeringTabId}
                onYearSelectCallBack={(e) => this.onYearSelection(e)}
            />
        </div>
    }
}


/**
 * This class builds a set of dropdown lists for the FST tab.
 * - version dropdown list
 * - year dropdown list
 */
class FSTDropdownList extends Component {

    /**
     * Constructor of the FST dropdown lists component
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.onYearSelection = this.onYearSelection.bind(this);
        this.state = {
            "year" : new Date().getFullYear()
        };
    }

    /**
     * Trigger change when Year selected
     */
     onYearSelection(e){
        this.setState({
            "year": e
        });
     }

    /**
     * Render the version and year dropdown lists
     * @returns {XML}
     */
    render(){
        return <div>
            <VersionDropdownList
                engineeringTabId={this.props.engineeringTabId}
                onVersionSelectCallback={this.props.onVersionSelectCallback}
                year={ this.state.year }
            />

            <YearDropdownList  
                engineeringTabId={this.props.engineeringTabId}
                onYearSelectCallBack={(e) => this.onYearSelection(e)}
            />
        </div>
    }
}

/**
 * This class builds a set of dropdown lists for the FST tab.
 * - module dropdown list
 * - version dropdown list
 * - year dropdown list
 */
class TrendsDropdownList extends Component {

    /**
     * Constructor of the FST dropdown lists component
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.startDateChange = this.startDateChange.bind(this);
        this.endDateChange = this.endDateChange.bind(this);
        this.isoDate = this.isoDate.bind(this);
        this.changeView = this.changeView.bind(this);

        let date = new Date();
        this.date = this.isoDate(date);
        this.state = {
            startDate : this.props.startDate ? this.props.startDate : (date.getFullYear()-1) + "-" + (date.getMonth()+1) + "-" + date.getDate(),
            endDate : this.props.endDate ? this.props.endDate : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate()
        };
    }

    changeView(e){
        this.props.onViewChangeCallBack(e);
    }

    isoDate(date) {
        if (!date) {
            return null
        }
        date = moment(date).toDate();

        // don't call toISOString because it takes the time zone into
        // account which we don't want.  Also don't call .format() because it
        // returns Arabic instead of English

        let month = 1 + date.getMonth();
        if (month < 10) {
            month = '0' + month
        }
        let day = date.getDate();
        if (day < 10) {
            day = '0' + day
        }
        return date.getFullYear() + '-' + month + '-' + day
    }

    /***
     * Handle Event to change the start date
     * @param e : changed start date
     */
    startDateChange(e){
       this.startDate = this.isoDate(e);
       this.props.handleStartDateChange(e);
    }
    /***
     * Handle Event to change the End date
     * @param e : changed End date
     */
    endDateChange(e){
        this.endDate = this.isoDate(e);
        this.props.handleEndDateChange(e);
    }

    componentWillReceiveProps(nextProps){
        let date = new Date();
        this.setState({
            startDate : nextProps.startDate ? nextProps.startDate : (date.getFullYear()-1) + "-" + (date.getMonth()+1) + "-" + date.getDate(),
            endDate : nextProps.endDate ? nextProps.endDate : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate()
        });
    }

    /**
     * Render the module, version and year dropdown lists
     * @returns {XML}
     */
    render(){
        return <div className="flex-layout trends-actions">
            <select className="select-udn" defaultValue="Bug Trends"
                    onChange={(e)=>this.changeView(e)} >>
                <option>Current Backlog</option>
                <option>Bug Trends</option>
            </select>
            <GranularityDropdownList 
                engineeringTabId={this.props.engineeringTabId}
                onGranularitySelect={this.props.onGranularitySelect}
            />
            <DatePicker maxDate={ this.date } defaultValue={null} showClearButton={false} value={ this.isoDate(this.props.startDate) } onChange={(e) => {this.startDateChange(e, 'start_time')}} />
            <DatePicker maxDate={ this.date } defaultValue={null} showClearButton={false} value={ this.isoDate(this.props.endDate) } onChange={(e) => {this.endDateChange(e, 'end_time')}} />
            <ModuleDropdownList
                engineeringTabId={this.props.engineeringTabId}
                onModuleSelectCallback={this.props.onModuleSelectCallback}
            />
        </div>
    }
}



