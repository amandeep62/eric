import React, {Component} from 'react'
import { EngineeringTabEnum } from "../../../../constants/constants";
import EngineeringTitle from '../EngineeringHeader/EngineeringTitle';
import BarChart from '../../globals/Charts/BarChart/BarChart';
import LineChart from '../../globals/Charts/LineChart/LineChart';
import {store, storeModule} from "../Store/Store";
import Modal from '../../globals/ModalPopup/modal'
import {TrendsApiData as _TrendData} from './TrendApiCall';
import "./Trends.less";


class Trends extends Component {
    /***
     * To Draw capacity bar chart
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);
        this.minHeight = 250;
        this.minWidth = 400;
        this.canvasSize = {
                            height: (window.innerHeight - 300) > this.minHeight ? (window.innerHeight - 300) : this.minHeight, 
                            width: (window.innerWidth / 2 - 30) > this.minWidth ? (window.innerWidth / 2 - 30) : this.minWidth
                        };

        this.mockDataForTheAPI = this.mockDataForTheAPI.bind(this);
        this.onModuleSelectCallback = this.onModuleSelectCallback.bind(this);
        this.onGranularitySelect = this.onGranularitySelect.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.dateDiff = this.dateDiff.bind(this);
        this.dateRangeWarning = this.dateRangeWarning.bind(this);
        this.barClickCallback = this.barClickCallback.bind(this);
        this.isoDate = this.isoDate.bind(this);
        this.resize = this.resize.bind(this)
        this.closeModal = this.closeModal.bind(this)

        //this.selectedGranularity = 1; // Sets the Default Granularity to Month, should come from the Store.

        let date = new Date();
        this.startTrendDate = (date.getFullYear()-1) + "-" + (date.getMonth()+1) + "-" + date.getDate();
        this.endTrendDate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
        this.granularityNum = 1;
        this.selectedModule = 'AN';//'DO,CDX,DOC,LB,MON,UDNP,CIS,CS,RENG,AN'; //storeModule.getState().splice(-1,1).join(",");
        this.selectedGranularity = "Monthly";
        this.trendsData = [];
        // Making it static for a while, this should be changed.
        this.state = {
            xAxis           : this.trendsData.axis_strech,
            canvasSize      : this.canvasSize,
            xSubAxis        : [],
            dataArrayBarJQL : [],
            plot1BarData    : [],
            plot1LineData   : [],
            plot1MaxValue   : [],
            plot2LineData   : [],
            startDate       : this.startTrendDate,
            endDate         : this.endTrendDate,
            loader: false,
            modal:false,
            modalContent : null
        };
    }

    componentDidMount(){
        document.title = "Trends";
        this.mockDataForTheAPI(this.selectedModule, this.startTrendDate, this.endTrendDate, this.selectedGranularity);
        window.addEventListener('resize', this.resize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize)
    }

    resize(){
        this.canvasSize = {
                            height: (window.innerHeight - 300) > this.minHeight ? (window.innerHeight - 300) : this.minHeight, 
                            width: (window.innerWidth / 2 - 30) > this.minWidth ? (window.innerWidth / 2 - 30) : this.minWidth
                        };
        this.setState({
            canvasSize : this.canvasSize
        });
    }

    mockDataForTheAPI(selectedModule, startDate, endDate , selectedGranularity){
        /**
         * validation to be implemented
         * inflow.length == outflow.length == backlog.length == axis_strech.length
         * total_backlog.length == triage_backlog.length == dev_backlog.length == test_backlog.length  == axis_strech.length
         */
        this.setState({
            loader : true
        });

        _TrendData(selectedModule, startDate, endDate , selectedGranularity , (result)=>{
            //let plot1BarData = this.getBarChartData();
            let plot1LineData = this.getBarChartRelativeData(result);
            let plot1MaxValue = this.getMaxValue(result);
            let plot2LineData = this.getLineChartData(result);
            this.setState({
                xAxis           : result.barChartInAndOutFlowLabels,
                xSubAxis        : result.barChartInAndOutFlowLabelsSub,
                dataArrayBarJQL : result.barChartInAndOutFlowJql,
                plot1BarData    : result.barChartInAndOutFlow,
                plot1LineData   : plot1LineData,
                plot1MaxValue   : plot1MaxValue,
                plot2LineData   : plot2LineData,
                loader: false
            }, function () {
                console.log(this.state.xAxis);
            });

        });

    }

    getBarChartRelativeData(result){
        return [{
                    data : result.lineChartForBacklog,
                    color : "#4472C4",
                    label : "Backlog",
                    link : result.lineChartForBacklogJql
                }];
    }

    getMaxValue(result){
        let chartData = result.barChartInAndOutFlow;
        let lineData =  result.lineChartForBacklog;
        let concatedData = chartData.concat(lineData);
        let maxValue = Math.max.apply(null, concatedData);
        return maxValue;
    }

    getLineChartData(backlogResults){
        return [{
                data : backlogResults.totalBacklogLine,
                color : "#4472C4",
                label : "Total Backlog",
                link : backlogResults.totalBacklogLineJql
            },
            {
                data : backlogResults.triageBacklogLine,
                color : "#11627e",
                label : "Triage Backlog",
                link : backlogResults.triageBacklogLineJql
            },
            {
                data : backlogResults.testBacklogLine,
                color : "#8ab762",
                label : "Test Backlog",
                link : backlogResults.testBacklogLineJql
            },
            {
                data : backlogResults.devBacklogLine,
                color : "#5431A9",
                label : "Dev Backlog",
                link : backlogResults.devBacklogLineJql
            }];
    }

    onGranularitySelect(_granularity){
        let tempDate = new Date(this.endTrendDate);
        switch(_granularity) {
            case '0':
                this.selectedGranularity = 'Yearly';
                tempDate.setMonth(tempDate.getMonth() - 12);
                break;
            case '1':
                this.selectedGranularity = 'Monthly';
                tempDate.setMonth(tempDate.getMonth() - 12);
                break;
            case '2':
                this.selectedGranularity = 'Quarterly';
                tempDate.setMonth(tempDate.getMonth() - 12);
                break;
            case '3':
                this.selectedGranularity = 'Weekly';
                tempDate.setMonth(tempDate.getMonth() - 3);
                break;
            case '4':
                this.selectedGranularity = 'Daily';
                tempDate.setDate(tempDate.getDate() - 14);
                break;
        }
        this.startTrendDate = this.isoDate(tempDate);
        this.setState({
            startDate: this.startTrendDate,
            endDate: this.endTrendDate
        });
        this.mockDataForTheAPI(this.selectedModule, this.startTrendDate, this.endTrendDate , this.selectedGranularity);
    }

    onModuleSelectCallback(selectedModule){
        switch(selectedModule) {
            case 'ALL':
                selectedModule = 'DO,CDX,DOC,LB,MON,UDNP,CIS,CS,RENG,AN';
                break;
        }
        this.selectedModule = selectedModule;
        this.mockDataForTheAPI(this.selectedModule, this.startTrendDate, this.endTrendDate , this.selectedGranularity);
    }


    handleStartDateChange(_startDate){
        this.startTrendDate = this.isoDate(_startDate);
        this.dateRangeWarning(_startDate, 0);
    }

    handleEndDateChange(_endDate){
        this.endTrendDate = this.isoDate(_endDate);
        this.dateRangeWarning(_endDate, 1);
    }

    dateDiff(datepart, fromdate, todate) {
        datepart = datepart.toLowerCase();
        let diff = todate - fromdate;
        let divideBy = { w:604800000,
            d:86400000,
            h:3600000,
            n:60000,
            s:1000 };

        return Math.floor( diff/divideBy[datepart]);
    }

    dateRangeWarning(date, flag){
        let that = this;
        let actualDiff;
        let modalContent;
        let expectedDiff = 0;
        switch(this.selectedGranularity) {
            case 'Monthly':
                    expectedDiff = 52;
                    modalContent = '12 Months';
                break;
            case 'Yearly':
                    expectedDiff = 625;
                    modalContent = '12 Years';
                break;
            case 'Quarterly':
                    expectedDiff = 156;
                    modalContent = '3 Years';
                break;
            case 'Weekly':
                    expectedDiff = 12;
                    modalContent = '12 Weeks';
                break;
            case 'Daily':
                    expectedDiff = 2;
                    modalContent = '14 Days';
                break;
        }

        actualDiff = flag ?
                    this.dateDiff('w', new Date(this.startTrendDate), new Date(date)) > expectedDiff :
                    this.dateDiff('w', new Date(date), new Date(this.endTrendDate)) > expectedDiff;

        if (actualDiff){
            this.setState({
                modal:true,
                modalContent : 'Duration cannot be more than ' + modalContent
            });
        } else {
            flag ? this.setState({ endDate: this.endTrendDate }) : this.setState({ startDate: this.startTrendDate });
            this.mockDataForTheAPI(this.selectedModule, this.startTrendDate, this.endTrendDate, this.selectedGranularity);
        }
        setTimeout(function(){
            that.setState({
                modal:false,
                modalContent : null
            });
        }, 1000);
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

    barClickCallback(index) {
        let link = "https://jira.ericssonudn.net/issues/?jql="+this.state.dataArrayBarJQL[index];
        window.open(link, "_blank");
    }

    closeModal(){
        this.setState(
            {modal:false}
        );
    }

    /***
     *
     * @returns {xml}
     */
    render(){

        return <div className="row">
                <EngineeringTitle
                    title={"TRENDS"}
                    engineeringTabId={EngineeringTabEnum.TRENDS.value}
                    onModuleSelectCallback={this.onModuleSelectCallback}
                    onVersionSelectCallback={this.onVersionSelect}
                    onYearSelectCallBack ={this.onYearSelectCallBack}
                    onGranularitySelect ={this.onGranularitySelect}
                    handleEndDateChange ={this.handleEndDateChange}
                    handleStartDateChange ={this.handleStartDateChange}
                    onViewChangeCallBack={this.props.onViewChangeCallBack}
                    startDate = { this.state.startDate }
                    endDate = { this.state.endDate }
                />
                <div id="trendsCharts" className="trends-tab col-md-12" >
                    {this.state.plot1BarData.length ? <div className="col-md-6">
                        <h5 className="text-center text-white">Inflow vs Outflow vs Backlog</h5>
                        <div className="trends-charts">
                            {this.state.loader ? <div className="flex-layout"><div className="loader"></div></div> :
                            <div>
                                <div>
                                    <BarChart
                                        canvasSize={this.state.canvasSize}
                                        dataArrayBar={ this.state.plot1BarData }
                                        xAxisArrayBar={ this.state.xAxis }
                                        xSubAxis  = { this.state.xSubAxis }
                                        alternateFactor={ 2 }
                                        versionNumber={"2.7"}
                                        maxValue = { this.state.plot1MaxValue }
                                        barClickCallback = { this.barClickCallback }
                                        legends = {{
                                            Legend1: "In Flow",
                                            Legend2: "Out Flow"
                                        }}
                                        lineChartData = {{
                                            xAxisArrayLine : this.state.xAxis,
                                            dataArrayLine  : this.state.plot1LineData,
                                            axis           : false,
                                            maxValueLine   : this.state.plot1MaxValue
                                        }}
                                    />
                                </div>
                            </div>}
                        </div>
                    </div> :
                        <div className="col-md-6">
                            <h5 className="text-center text-white"></h5>
                            <div className="flex-layout">
                                <div className="loader"></div>
                            </div>
                        </div> }
                    { this.state.plot2LineData.length ? <div className="col-md-6 backlog-line-chart">
                            <h5 className="text-center text-white">Backlog</h5>
                            {this.state.loader ? <div className="flex-layout"><div className="loader"></div></div> :
                                <LineChart
                                    canvasSize = { this.state.canvasSize }
                                    xAxisArray = { this.state.xAxis }
                                    xSubAxis  = { this.state.xSubAxis }
                                    dataArray = { this.state.plot2LineData }
                                />}
                    </div> :
                        <div className="col-md-6">
                            <h5 className="text-center text-white"></h5>
                            <div className="flex-layout"><div className="loader"></div></div>
                        </div>}
                </div>
            <Modal isOpen={this.state.modal} className="date-range-warning" bgColor={'white'} onClose={() => this.closeModal()}>
                <div className="text-danger">{this.state.modalContent}</div>
            </Modal>
        </div>
    }
}

export default Trends