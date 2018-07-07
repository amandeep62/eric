/**
 * @description     : Component container for KPI module
 * @prop {String}   : userPermissions, required
 * 
 */
import { Component, PropTypes } from 'react';
import EditKPIModel from './EditKPIModel';

//Anything imported from globals
import { userPermissions as _USERPERMISSIONS, QUARTERLY as _QUARTERLY } from '../../../constants/constants';
import DoughnutChart from "../globals/Charts/DoughnutChart";
import { cloneDeep as _cloneDeep } from "lodash";
import { getHttpRequest } from "../../../httprequest/http_connection";
import "./kpi.less";

class KPI extends Component {

    /**
     * @description Constructor
     * @param {*} props 
     * @param {*} context 
     */
    constructor(props, context) {
        super(props, context);
        this.getAllChartsForYear    = this.getAllChartsForYear.bind(this);
        this.changePropertyState    = this.changePropertyState.bind(this);
        this.onYearSelect           = this.onYearSelect.bind(this);
        this.openEditModal          = this.openEditModal.bind(this);
        this.closeModal             = this.closeModal.bind(this);
        this.onChangeQuarter        = this.onChangeQuarter.bind(this);
        let year                    = new Date().getFullYear();
        this.kpiStates              = []; // Maybe not required.

        this.state = {
            year                : year,
            propertyStates      : [..._QUARTERLY],
            filterPropStates    : [..._QUARTERLY],
            currentPropertyState: year,
            modalPopup          : false,
            allCharts           : [],
            allYears            : [],
            showModelPopup      : false
        };
        this.getAllChartsForYear(year);
    }

    /**
     * @description Does an HTTP ajax call and fetches charts details for selected year.
     * @param {*} year 
     */
    getAllChartsForYear(year){
        let that = this;
        //get the data for the KPI by year
        getHttpRequest("/get_development_KPI?year=" + year, function (data) {

            
            let allCharts = JSON.parse(data);

            getHttpRequest("/getSoftwareReleaseCount?year=" + year, function (swrelease) {

                let swRelease = JSON.parse(swrelease);
                allCharts = allCharts.concat(swRelease);

                getHttpRequest("/years", function (years) {
                    let allYears = JSON.parse(years);
                    

                    getHttpRequest('/get_kpiState', function(kpiStates){
                        that.kpiStates = JSON.parse(kpiStates);
                        that.setState({
                            allCharts: allCharts,
                            allYears: allYears
                        });
                    });
                });   
            });
        });
    }

    /**
     * @description TODO : Updates property state. Currently looks like redundant should be checked and removed
     *  if required
     * @param {*} state
     */
    changePropertyState(state){
    	this.setState({
    		currentPropertyState: state
    	});
    }

    /**
     * @description Invoked when year picker value is changed and fetches chart data for that year.
     * @param {*} event 
     */
    onYearSelect(event){
    	let that = this;
    	let year = event.target.value;

    	getHttpRequest("/get_development_KPI?year=" + year, function (data) {
            
    		let allCharts = JSON.parse(data);

            getHttpRequest("/getSoftwareReleaseCount?year=" + year, function (swrelease) {

                let swRelease = JSON.parse(swrelease);
                allCharts = allCharts.concat(swRelease);

                that.setState({
                    year                : year,
                    allCharts           : allCharts,
                    propertyStates      : [..._QUARTERLY],
                    currentPropertyState: year
                });
            });
    	});
    }

    /**
     * @description Sets state to modalPopup true to activate popup
     */
    openEditModal(){
        let that = this;
        that.setState({
            modalPopup:true
        });
    }

    /**
     * @description Invoked when Modal is closed
     */
    closeModal(){
    	this.setState({
    		modalPopup:false
    	});
    }

    /**
     * @description Invoked when quarter checkboxes are changed, updates the filterPropStates according to
     * relevant active checkboxes.
     * @param {*} status
     * @param {Array} filterPropStatesArray 
     */
    onChangeQuarter(status, filterPropStatesArray){
        let index = filterPropStatesArray.indexOf(status);
        let filterPropStatesTempArray = [];
        if(index !== -1){
            filterPropStatesTempArray = filterPropStatesArray.splice(filterPropStatesArray.indexOf(status), 1);
            this.setState({filterPropStatesArray:filterPropStatesTempArray});
        }
        else{
            filterPropStatesTempArray = filterPropStatesArray;
        }
        this.setState({filterPropStatesArray:filterPropStatesTempArray.push(status)});
    }

    componentDidMount(){
        document.title = "KPI";
    }

    /**
     * @description Component Render lifecycle function
     */
    render() {
        let viewPanel;
        let that = this;
        let j = 0;
        let filteredChartArray = [];
        let filterPropStatesArray = this.state.filterPropStates;

        // Loop through all the objects filter them by kpi_id and get the filtered sum of all
        this.state.allCharts.map(function(chartObject) {
            let exist;
            chartObject = _cloneDeep(chartObject);
            exist = filteredChartArray.filter(function(tempOb){
                            if(tempOb.kpi_id === chartObject.kpi_id){
                                return chartObject;
                            }
            });
            if(exist.length > 0 ){
                filteredChartArray.map( function (temp, tempIndex){

                    if(temp.kpi_id == chartObject.kpi_id
                        && that.state.filterPropStates.indexOf(chartObject.quater) != -1 ){
                        filteredChartArray[tempIndex].achieved = temp.achieved + chartObject.achieved;
                        filteredChartArray[tempIndex].remaining = temp.remaining + chartObject.remaining;
                        filteredChartArray[tempIndex].goal = temp.goal + chartObject.goal;
                    }
                })
            }else{
                if(Array.isArray(that.state.filterPropStates)){
                    if(that.state.filterPropStates.indexOf(chartObject.quater) !== -1){
                        filteredChartArray.push(chartObject);
                    }
                }
            }
        });

        this.kpiStates.forEach(function( item, index ) {
            // if( filteredChartArray.indexOf)
            let found = 0;
            filteredChartArray.forEach(function (chartData) {
                if(chartData.kpi_state === item.kpi_state )
                    found = 1;
            });
            if(found === 0){
                let refObject = {
                        "development_KPI_id":index+1,
                        "kpi_id": index+1,
                        "year":that.state.year,
                        "kpi_state":item.kpi_state,
                        "quater":"Q1",
                        "achieved":0,
                        "remaining":0,
                        "goal":0
                    };
                filteredChartArray.push(refObject);
            }
            filteredChartArray.sort(function(a, b) {
                return parseFloat(a.kpi_id) - parseFloat(b.kpi_id);
            });
        });

        // Map through the list of filtered chart data and convert it to relavant JSX
        let doughnutChartHTML = filteredChartArray.length > 0 ? filteredChartArray.map(function(doughnut, rowKey) {
            let tooltipArray = ['Achieved', 'Goal-Actual']; // Changed according to new representation of chart
            let chartTextCenterString = (doughnut.goal % 1 !== 0) ? doughnut.goal.toFixed(2) : '' + doughnut.goal; 
                                                return (
                                                            <DoughnutChart
                                                                key = { "doughnut" + rowKey } 
                                                                numbers={[doughnut.achieved, doughnut.remaining]}
                                                                tooltip={ tooltipArray } 
                                                                textCenter={ chartTextCenterString } 
                                                                selectedStrokeColor="red"  
                                                                arcRadius={30} 
                                                                colorArray={["#1E7E95", "#A6A6A6"]} 
                                                                percentageView={ true } 
                                                                sectorSelectionDisabled = { true } 
                                                                canvasSize={ {width:200, height:200} } 
                                                                disableSum = { true } 
                                                                centerFontSize = { 22 }
                                                                centerTextColor = { "#008b87" }
                                                                title = { doughnut.kpi_state } />

                                                )
                                            }) : <div> No QUARTERS selected to Display Information.</div>;



        viewPanel = <div id ="donutChart" className="col-sm-12 no-padding">
                                        { doughnutChartHTML }
                    </div>;

        filteredChartArray.slice(0, filteredChartArray.length);

        // Checks for if edit mode is enable and creates the editModalHTML equivalent.
        let editKPIModalHTML = this.state.modalPopup ?
                    <EditKPIModel getAllChartsForYear={this.getAllChartsForYear} alltableData={this.state.allCharts} 
                                     closeModel={this.closeModal} year={this.state.year}/> : "";
        
        // Creates the HTML list from the propertyStates object
        let propertyStatesHTML = this.state.propertyStates.map(function (status, index) {
                                    j++;
                                    return (
                                        <li key={"li" + index}>
                                            <p key={"p" + index}>
                                                <input 
                                                    key={"input" + index} 
                                                    type="checkbox" 
                                                    name="filter" 
                                                    value={status}
                                                    id={"check" + j } 
                                                    onChange={()=>that.onChangeQuarter(status, filterPropStatesArray)}
                                                    defaultChecked/>
                                                <label key={"label" + index}
                                                       htmlFor={"check" + j }>{status}</label>
                                            </p>
                                        </li>
                                    );
                                });

        // Creats the HTML dropdown from teh list of allYears
        let allYearsHTML = this.state.allYears.map(function (data, index) {
            
                return (<option key={index} value={data.year} name={data.year}
                                id={"version_" + data.year}
                                selected={data.year == that.state.year}>{data.year}</option>);
            

        });

        // Edit button , enabled if user have permission to edit.
        let editButtonHTML = localStorage.userPermissions === _USERPERMISSIONS ?
                            <div className="pull-right editKpiModel" onClick={() => this.openEditModal()}>
                                <a className="editRoadMap badge version" id="badgeSummary">
                                    <h6 className="glyphicon glyphicon-pencil fa-lg"> </h6>
                                </a>
                            </div>   : "";

        return (
            <div className="row kpiView">
                <div className="header-section">
                    <div className="pull-left tabsUI">
                        <ul className="filterCustomer" id="KPItabsUI">
                            { propertyStatesHTML }
                        </ul>
                    </div>
                    <div className="pull-right">
                        { editButtonHTML }
                        <select
                            className="releaseHomeSelection" 
                            id="yearSelection" 
                            onChange={(e)=>this.onYearSelect(e)}>
                            { allYearsHTML }
                        </select>
                    </div>
                    { editKPIModalHTML }
                </div>
                <div className="view-section">
                    {viewPanel}
                </div>
            </div>
        )
    }
}

KPI.propTypes = {
    userPermissions : PropTypes.string
}

export default KPI;